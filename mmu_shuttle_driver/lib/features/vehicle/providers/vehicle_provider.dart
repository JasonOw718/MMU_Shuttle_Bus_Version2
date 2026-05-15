import 'package:flutter/material.dart';
import 'package:mmu_shuttle_driver/features/vehicle/models/vehicle_model.dart';
import 'package:mmu_shuttle_driver/features/vehicle/services/vehicle_service.dart';

class VehicleProvider extends ChangeNotifier {
  // variables
  List<VehicleModel> _vehicles = [];
  bool _isLoading = false;
  String? _errorMessage;

  final _vehicleService = VehicleService();

  // getters
  List<VehicleModel> get vehicles => _vehicles;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  // methods
  Future<void> fetchVehicles() async {
    _setLoadingState(true);
    try {
      _vehicles = await _vehicleService.fetchVehicles();
      _setLoadingState(false);
    } catch (e) {
      _setLoadingState(false, error: e.toString());
    }
  }

  void _setLoadingState(bool loading, {String? error}) {
    _isLoading = loading;
    _errorMessage = error;
    notifyListeners();
  }

  void clearData() {
    _vehicles = [];
    _isLoading = false;
    _errorMessage = null;
  }
}
