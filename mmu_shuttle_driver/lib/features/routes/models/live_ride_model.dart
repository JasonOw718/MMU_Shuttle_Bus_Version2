class LiveRideModel {
  final int routeId;
  final int vehicleId;
  final double latitude;
  final double longitude;

  // Debug payload metadata (only populated for streaming updates).
  final double? speed;
  final double? accuracy;
  final int? batteryLevel;
  final bool? isCharging;
  final String? appState;
  final DateTime? timestamp;

  LiveRideModel({
    required this.routeId,
    required this.vehicleId,
    required this.latitude,
    required this.longitude,
    this.speed,
    this.accuracy,
    this.batteryLevel,
    this.isCharging,
    this.appState,
    this.timestamp,
  });

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{
      'routeId': routeId,
      'vehicleId': vehicleId,
      'location': {'latitude': latitude, 'longitude': longitude},
    };
    if (speed != null) json['speed'] = speed;
    if (accuracy != null) json['accuracy'] = accuracy;
    if (batteryLevel != null) json['batteryLevel'] = batteryLevel;
    if (isCharging != null) json['isCharging'] = isCharging;
    if (appState != null) json['appState'] = appState;
    if (timestamp != null) {
      json['timestamp'] = timestamp!.toUtc().toIso8601String();
    }
    return json;
  }
}
