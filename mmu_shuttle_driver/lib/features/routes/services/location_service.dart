import 'dart:async';
import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:mmu_shuttle_driver/core/authentication/token_manager.dart';
import 'package:mmu_shuttle_driver/core/constants.dart';
import 'package:mmu_shuttle_driver/core/exceptions/LocationException.dart';
import 'package:mmu_shuttle_driver/core/routing/app_router.dart';
import 'package:mmu_shuttle_driver/core/utils/toast.dart';
import 'package:mmu_shuttle_driver/features/authentication/services/auth_service.dart';
import 'package:mmu_shuttle_driver/features/routes/models/live_ride_model.dart';
import 'package:stomp_dart_client/stomp_dart_client.dart';

class LocationService {
  StompClient? _stompClient;
  StreamSubscription<Position>? _positionSubscription;
  bool _isConnected = false;
  bool _isRefreshingToken = false;

  Future<Position> getCurrentLocation() async {
    bool serviceEnabled;

    LocationPermission permission;

    serviceEnabled = await Geolocator.isLocationServiceEnabled();

    if (!serviceEnabled) {
      throw LocationException('Location services are disabled.');
    }

    permission = await Geolocator.checkPermission();

    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();

      if (permission == LocationPermission.denied) {
        throw LocationException('Location permissions are denied');
      }
    }

    if (permission == LocationPermission.deniedForever) {
      throw LocationException(
        'Location permissions are permanently denied, we cannot request permissions.',
      );
    }

    return await Geolocator.getCurrentPosition(
      locationSettings: const LocationSettings(
        accuracy: LocationAccuracy.high,
        distanceFilter: 10,
        timeLimit: Duration(seconds: 10),
      ),
    );
  }

  void startLocationStreaming(
    Function(Position) onPositionUpdate,
    Function(dynamic) onError,
  ) {
    LocationSettings locationSettings;

    if (defaultTargetPlatform == TargetPlatform.android) {
      locationSettings = AndroidSettings(
        accuracy: LocationAccuracy.high,
        distanceFilter: 10,
        forceLocationManager: false,
        foregroundNotificationConfig: const ForegroundNotificationConfig(
          notificationText: "Actively sharing live location with students...",
          notificationTitle: "MMU Shuttle Bus (Driver)",
          enableWakeLock: true,
          notificationIcon: AndroidResource(name: 'launcher_icon'),
        ),
      );
    } else {
      locationSettings = const LocationSettings(
        accuracy: LocationAccuracy.high,
        distanceFilter: 10,
      );
    }

    _positionSubscription =
        Geolocator.getPositionStream(locationSettings: locationSettings).listen(
          (Position position) {
            onPositionUpdate(position);
          },
          onError: onError,
        );
  }

  void initializeConnection() async {
    final context = rootNavigatorKey.currentContext;
    final token = TokenManager.accessToken;
    _stompClient = StompClient(
      config: StompConfig(
        url: WEB_SOCKET_URL,
        onConnect: _onConnect,
        onWebSocketError: (dynamic error) {
          _isConnected = false;
          if (context != null) {
            showErrorToast(context, 'WebSocket Error: $error');
          } else {
            print('WebSocket Error (No Context): $error');
          }
        },
        onStompError: (StompFrame frame) async {
          _isConnected = false;

          final errorMsg =
              frame.headers['message'] ?? frame.body ?? 'Unknown STOMP Error';

          if (errorMsg == 'JWT_EXPIRED') {
            await _refreshTokenAndReconnect(context);
            return;
          }

          if (context != null) {
            showErrorToast(context, 'STOMP Error: $errorMsg');
          } else {
            print('STOMP Error (No Context): $errorMsg');
          }
        },
        onDisconnect: (StompFrame frame) {
          _isConnected = false;
          print("Disconnect");
        },
        reconnectDelay: const Duration(seconds: 5),
        connectionTimeout: const Duration(seconds: 10),
        stompConnectHeaders: {
          if (token != null && token.isNotEmpty)
            'Authorization': 'Bearer $token',
        },
      ),
    );

    _stompClient?.activate();
  }

  void _onConnect(StompFrame frame) {
    print("Connected!");
    _isConnected = true;
  }

  Future<void> _refreshTokenAndReconnect(BuildContext? context) async {
    if (_isRefreshingToken) return;
    _isRefreshingToken = true;

    // Stop further reconnect attempts while we refresh the token.
    _stompClient?.deactivate();

    try {
      final authService = AuthService();
      final loginRequest = await authService.loadCredentialsFromStorage();
      await authService.signIn(loginRequest);

      // Reconnect with the freshly issued token.
      initializeConnection();
    } catch (e) {
      if (context != null && context.mounted) {
        showErrorToast(context, SESSION_EXPIRED_MESSAGE);
      } else {
        print('token refresh failed: $e');
      }
    } finally {
      _isRefreshingToken = false;
    }
  }

  void sendLiveLocation(LiveRideModel liveRideModel) {
    if (!_isConnected) {
      return;
    }

    try{
      _stompClient?.send(
        destination: '/app/updateLocation',
        body: jsonEncode(liveRideModel.toJson()),
      );
    } catch (e) {
      print('Error sending live location: $e');
    }
  }

  void disconnect() {
    _positionSubscription?.cancel();
    _stompClient?.deactivate();
    _isConnected = false;
    print("disconnected");
  }
}
