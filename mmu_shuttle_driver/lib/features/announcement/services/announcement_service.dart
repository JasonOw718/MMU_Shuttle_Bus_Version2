import 'package:dio/dio.dart';
import 'package:mmu_shuttle_driver/core/constants.dart';
import 'package:mmu_shuttle_driver/core/network/api.dart';
import 'package:mmu_shuttle_driver/features/announcement/models/announcement_category_model.dart';
import 'package:mmu_shuttle_driver/features/announcement/models/announcement_model.dart';

List<AnnouncementModel> announcements = [];

class AnnouncementService {
  Future<List<AnnouncementCategoryModel>> fetchAnnouncementCategories() async {
    try {
      final response = await dio.get("/announcements/categories");
      if (response.statusCode == 200) {
        return response.data
            .map<AnnouncementCategoryModel>(
              (json) => AnnouncementCategoryModel.fromJson(json),
            )
            .toList();
      }
      throw Exception(DEFAULT_ERROR_MESSAGE);
    } on DioException catch (e) {
      throw Exception(e.response?.data['message'] ?? DEFAULT_ERROR_MESSAGE);
    } catch (e) {
      throw Exception(DEFAULT_ERROR_MESSAGE);
    }
  }

  Future<List<AnnouncementModel>> fetchAnnouncements() async {
    try {
      final response = await dio.get("/announcements/all");
      if (response.statusCode == 200) {
        return response.data
            .map<AnnouncementModel>((json) => AnnouncementModel.fromJson(json))
            .toList();
      }
      throw Exception(DEFAULT_ERROR_MESSAGE);
    } on DioException catch (e) {
      throw Exception(e.response?.data['message'] ?? DEFAULT_ERROR_MESSAGE);
    } catch (e) {
      throw Exception(DEFAULT_ERROR_MESSAGE);
    }
  }

  Future<AnnouncementModel> createNewAnnouncement(FormData formData) async {
    try {
      final response = await dio.post(
        "/announcements/create",
        data: formData,
        options: Options(headers: {"Content-Type": "multipart/form-data"}),
      );
      if (response.statusCode == 200) {
        return AnnouncementModel.fromJson(response.data);
      }
      throw Exception(DEFAULT_ERROR_MESSAGE);
    } on DioException catch (e) {
      throw Exception(e.response?.data['message'] ?? DEFAULT_ERROR_MESSAGE);
    } catch (e) {
      throw Exception(DEFAULT_ERROR_MESSAGE);
    }
  }

  Future<AnnouncementModel> togglePin(int id) async {
    try {
      final response = await dio.patch("/announcements/$id/toggle");
      if (response.statusCode == 200) {
        return AnnouncementModel.fromJson(response.data);
      }
      throw Exception(DEFAULT_ERROR_MESSAGE);
    } on DioException catch (e) {
      throw Exception(e.response?.data['message'] ?? DEFAULT_ERROR_MESSAGE);
    } catch (e) {
      throw Exception(DEFAULT_ERROR_MESSAGE);
    }
  }
}
