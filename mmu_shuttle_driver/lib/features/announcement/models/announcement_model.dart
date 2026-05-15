class AnnouncementModel {
  final int id;
  final String title;
  final String description;
  final String? fileName;
  bool isPinned;
  final DateTime createdAt;
  final String busPlate;

  AnnouncementModel({
    required this.id,
    required this.title,
    required this.description,
    required this.fileName,
    required this.isPinned,
    required this.createdAt,
    required this.busPlate,
  });

  factory AnnouncementModel.fromJson(Map<String, dynamic> json) {
    return AnnouncementModel(
      id: json['id'] ?? 0,
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      fileName: json['fileName'],
      isPinned: json['isPinned'] ?? false,
      createdAt: DateTime.tryParse(json['createdAt'] ?? '') ?? DateTime.now(),
      busPlate: json['busPlate'] ?? '',
    );
  }

  AnnouncementModel copyWith({
    int? id,
    String? title,
    String? description,
    DateTime? createdAt,
    bool? isPinned,
    String? fileName,
    String? busPlate,
  }) {
    return AnnouncementModel(
      id: id ?? this.id,
      title: title ?? this.title,
      description: description ?? this.description,
      createdAt: createdAt ?? this.createdAt,
      isPinned: isPinned ?? this.isPinned,
      fileName: fileName ?? this.fileName,
      busPlate: busPlate ?? this.busPlate,
    );
  }
}
