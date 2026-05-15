class AnnouncementCategoryModel {
  final int id;
  final String title;
  final String description;

  AnnouncementCategoryModel({
    required this.id,
    required this.title,
    required this.description,
  });

  factory AnnouncementCategoryModel.fromJson(Map<String, dynamic> json) {
    return AnnouncementCategoryModel(
      id: json['id'] ?? 0,
      title: json['title'] ?? '',
      description: json['description'] ?? '',
    );
  }
}
