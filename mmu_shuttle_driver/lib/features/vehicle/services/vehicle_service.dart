import 'package:dio/dio.dart';
import 'package:mmu_shuttle_driver/core/constants.dart';
import 'package:mmu_shuttle_driver/core/network/api.dart';
import 'package:mmu_shuttle_driver/features/vehicle/models/vehicle_model.dart';

class VehicleService {
  Future<List<VehicleModel>> fetchVehicles() async {
    try {
      final response = await dio.get("/vehicles/all");
      if (response.statusCode == 200) {
        return response.data
            .map<VehicleModel>((json) => VehicleModel.fromJson(json))
            .toList();
      }
      throw Exception(DEFAULT_ERROR_MESSAGE);
    } on DioException catch (e) {
      throw Exception(e.response?.data['message'] ?? DEFAULT_ERROR_MESSAGE);
    } catch (e) {
      throw Exception(DEFAULT_ERROR_MESSAGE);
    }
  }
}
