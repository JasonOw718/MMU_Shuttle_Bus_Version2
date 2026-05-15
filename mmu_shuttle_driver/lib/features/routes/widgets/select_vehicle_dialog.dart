import 'package:flutter/material.dart';
import 'package:mmu_shuttle_driver/features/vehicle/models/vehicle_model.dart';
import 'package:mmu_shuttle_driver/features/vehicle/providers/vehicle_provider.dart';
import 'package:provider/provider.dart';

class SelectVehicleDialog extends StatefulWidget {
  final void Function(VehicleModel vehicle) onSelected;

  const SelectVehicleDialog({super.key, required this.onSelected});

  @override
  State<SelectVehicleDialog> createState() => _SelectVehicleDialogState();
}

class _SelectVehicleDialogState extends State<SelectVehicleDialog> {
  VehicleModel? _selectedVehicle;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<VehicleProvider>().fetchVehicles();
    });
  }

  void _onSelectVehicle(VehicleModel? vehicle) {
    setState(() {
      _selectedVehicle = vehicle;
    });
  }

  void _onCancel() {
    Navigator.of(context).pop();
  }

  void _onConfirm() {
    if (_selectedVehicle == null) return;
    Navigator.of(context).pop();
    widget.onSelected(_selectedVehicle!);
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Consumer<VehicleProvider>(
          builder: (context, provider, _) {
            return Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Select Bus Plate',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Choose the vehicle you are driving before starting the journey.',
                  style: TextStyle(
                    fontSize: 13,
                    color: Colors.grey.shade600,
                  ),
                ),
                const SizedBox(height: 16),
                _buildContent(provider),
                const SizedBox(height: 20),
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    TextButton(
                      onPressed: _onCancel,
                      child: const Text('Cancel'),
                    ),
                    const SizedBox(width: 8),
                    ElevatedButton(
                      onPressed: _selectedVehicle == null ? null : _onConfirm,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF003399),
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                      child: const Text('Start'),
                    ),
                  ],
                ),
              ],
            );
          },
        ),
      ),
    );
  }

  Widget _buildContent(VehicleProvider provider) {
    if (provider.isLoading) {
      return const Padding(
        padding: EdgeInsets.symmetric(vertical: 24),
        child: Center(child: CircularProgressIndicator()),
      );
    }

    final error = provider.errorMessage;
    if (error != null) {
      return Padding(
        padding: const EdgeInsets.symmetric(vertical: 12),
        child: Text(
          error,
          style: TextStyle(color: Colors.red.shade600, fontSize: 13),
        ),
      );
    }

    final vehicles = provider.vehicles;
    if (vehicles.isEmpty) {
      return Padding(
        padding: const EdgeInsets.symmetric(vertical: 12),
        child: Text(
          'No vehicles available',
          style: TextStyle(color: Colors.grey.shade600, fontSize: 13),
        ),
      );
    }

    return DropdownButtonFormField<VehicleModel>(
      initialValue: _selectedVehicle,
      isExpanded: true,
      decoration: InputDecoration(
        hintText: 'Select a bus plate',
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
        ),
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 12,
          vertical: 8,
        ),
      ),
      items: vehicles
          .map(
            (vehicle) => DropdownMenuItem<VehicleModel>(
              value: vehicle,
              child: Text(vehicle.busPlate),
            ),
          )
          .toList(),
      onChanged: _onSelectVehicle,
    );
  }
}
