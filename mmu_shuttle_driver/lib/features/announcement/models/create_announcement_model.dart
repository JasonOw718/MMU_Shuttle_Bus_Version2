class CreateAnnouncementModel {
  final String title;
  final String description;
  final bool isPinned;
  final int? vehicleId;

  CreateAnnouncementModel({
    required this.title,
    required this.description,
    required this.isPinned,
    required this.vehicleId,
  });

  Map<String, dynamic> toJson() {
    return {
      'title': title,
      'description': description,
      'isPinned': isPinned,
      'vehicleId': vehicleId,
    };
  }
}
