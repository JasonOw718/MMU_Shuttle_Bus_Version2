import 'package:dio/dio.dart';
import 'package:mmu_shuttle_driver/core/authentication/token_manager.dart';
import 'package:mmu_shuttle_driver/core/constants.dart';
import 'package:mmu_shuttle_driver/core/routing/app_router.dart';
import 'package:mmu_shuttle_driver/core/utils/toast.dart';
import 'package:mmu_shuttle_driver/features/authentication/services/auth_service.dart';

final Dio dio = _setupDio();

Dio _setupDio() {
  final instance = Dio(
    BaseOptions(
      baseUrl: API_URL,
      connectTimeout: const Duration(seconds: 5),
      receiveTimeout: const Duration(seconds: 5),
    ),
  );

  instance.interceptors.add(
    InterceptorsWrapper(
      onRequest: (options, handler) {
        final token = TokenManager.accessToken;

        if (token != null && token.isNotEmpty) {
          options.headers['Authorization'] = 'Bearer $token';
        }

        return handler.next(options);
      },
      onError: (DioException e, handler) async {
        if (SESSION_EXPIRED_MESSAGE == e.response?.data['message']) {
          final context = rootNavigatorKey.currentContext;
          try {
            final retryResponse = await AuthService().renewToken(
              context,
              () => instance.fetch(e.requestOptions),
            );
            return handler.resolve(retryResponse);
          } catch (refreshError) {
            print('Refresh Token Error: $refreshError');
            if (context != null && context.mounted) {
              showErrorToast(context, refreshError.toString());
            }
          }
        }

        return handler.next(e);
      },
    ),
  );

  return instance;
}
