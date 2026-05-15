class LiveRideModel {
  final int routeId;
  final int vehicleId;
  final double latitude;
  final double longitude;

  LiveRideModel({
    required this.routeId,
    required this.vehicleId,
    required this.latitude,
    required this.longitude,
  });

  Map<String, dynamic> toJson() {
    return {
      'routeId': routeId,
      'vehicleId': vehicleId,
      'location': {'latitude': latitude, 'longitude': longitude},
    };
  }
}
