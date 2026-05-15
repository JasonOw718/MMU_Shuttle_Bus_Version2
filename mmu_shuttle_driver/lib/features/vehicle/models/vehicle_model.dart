class VehicleModel {
  final int id;
  final String busPlate;

  VehicleModel({required this.id, required this.busPlate});

  factory VehicleModel.fromJson(Map<String, dynamic> json) {
    return VehicleModel(
      id: json['id'] ?? 0,
      busPlate: json['busPlate'] ?? '',
    );
  }
}
