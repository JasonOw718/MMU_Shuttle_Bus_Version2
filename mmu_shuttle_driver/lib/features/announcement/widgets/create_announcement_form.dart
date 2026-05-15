import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:form_validator/form_validator.dart';
import 'package:image_picker/image_picker.dart';
import 'package:mmu_shuttle_driver/core/utils/toast.dart';
import 'package:mmu_shuttle_driver/core/widgets/custom_elevated_button.dart';
import 'package:mmu_shuttle_driver/features/announcement/models/announcement_category_model.dart';
import 'package:mmu_shuttle_driver/features/announcement/providers/announcement_provider.dart';
import 'package:mmu_shuttle_driver/features/vehicle/models/vehicle_model.dart';
import 'package:mmu_shuttle_driver/features/vehicle/providers/vehicle_provider.dart';
import 'package:provider/provider.dart';

class CreateAnnouncementForm extends StatefulWidget {
  final Future<void> Function(
    String title,
    String description,
    bool isPinned,
    int? vehicleId,
    PlatformFile? uploadedFile,
  )
  onSubmitted;
  final bool isLoading;
  final bool isFromLiveRide;

  const CreateAnnouncementForm({
    super.key,
    required this.onSubmitted,
    required this.isLoading,
    this.isFromLiveRide = false,
  });

  @override
  State<CreateAnnouncementForm> createState() => _CreateAnnouncementFormState();
}

class _CreateAnnouncementFormState extends State<CreateAnnouncementForm> {
  // variables
  bool _isPinned = false;
  bool _isCustom = false;
  PlatformFile? _selectedFile;
  AnnouncementCategoryModel? _selectedCategory;
  VehicleModel? _selectedVehicle;
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      context.read<AnnouncementProvider>().fetchCategories();
      context.read<VehicleProvider>().fetchVehicles();
    });
  }

  bool get _shouldShowVehicleDropdown => !widget.isFromLiveRide && !_isCustom;

  // methods
  Future<void> _handleSubmit() async {
    final int? vehicleId = _shouldShowVehicleDropdown
        ? _selectedVehicle?.id
        : null;

    if (_shouldShowVehicleDropdown && vehicleId == null) {
      showErrorToast(context, 'Please select a bus plate');
      return;
    }

    if (_isCustom) {
      if (!_formKey.currentState!.validate()) return;
      await widget.onSubmitted(
        _titleController.text,
        _descriptionController.text,
        _isPinned,
        vehicleId,
        _selectedFile,
      );
      return;
    }

    if (_selectedCategory == null) {
      showErrorToast(context, 'Please select an announcement type');
      return;
    }

    final category = _selectedCategory!;
    await widget.onSubmitted(
      category.title,
      category.description,
      _isPinned,
      vehicleId,
      _selectedFile,
    );
  }

  void _onSelectCategory(AnnouncementCategoryModel category) {
    setState(() {
      _selectedCategory = category;
    });
  }

  void _onSelectVehicle(VehicleModel? vehicle) {
    setState(() {
      _selectedVehicle = vehicle;
    });
  }

  void _onToggleCustom(bool value) {
    setState(() {
      _isCustom = value;
      if (value) {
        _selectedCategory = null;
      } else {
        _titleController.clear();
        _descriptionController.clear();
      }
    });
  }

  Widget _buildModeSegment({
    required String label,
    required bool selected,
    required bool value,
  }) {
    return Expanded(
      child: GestureDetector(
        onTap: widget.isLoading ? null : () => _onToggleCustom(value),
        behavior: HitTestBehavior.opaque,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 150),
          padding: const EdgeInsets.symmetric(vertical: 8),
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: selected ? Colors.white : Colors.transparent,
            borderRadius: BorderRadius.circular(6),
            boxShadow: selected
                ? [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.06),
                      blurRadius: 4,
                      offset: const Offset(0, 1),
                    ),
                  ]
                : null,
          ),
          child: Text(
            label,
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w500,
              color: selected ? const Color(0xFF4D6BB3) : Colors.grey.shade500,
            ),
          ),
        ),
      ),
    );
  }

  void _onTogglePin(value) {
    setState(() {
      _isPinned = value;
    });
  }

  Future<void> _pickFile() async {
    FilePickerResult? result = await FilePicker.platform.pickFiles(
      type: FileType.image,
      withData: true,
    );

    if (result != null) {
      setState(() {
        _selectedFile = result.files.first;
      });
    }
  }

  Future<void> _openCamera() async {
    try {
      final XFile? photo = await ImagePicker().pickImage(
        source: ImageSource.camera,
        imageQuality: 80,
      );

      if (photo == null) return;

      final bytes = await photo.readAsBytes();

      if (!mounted) return;

      setState(() {
        _selectedFile = PlatformFile(
          name: photo.name,
          size: bytes.length,
          bytes: bytes,
          path: photo.path,
        );
      });
    } catch (e) {
      if (!mounted) return;
      showErrorToast(context, "Error opening camera: $e");
    }
  }

  void _showAttachmentOptions() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (sheetContext) {
        return SafeArea(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              ListTile(
                leading: const Icon(Icons.camera_alt_outlined),
                title: const Text('Camera'),
                onTap: () {
                  Navigator.of(sheetContext).pop();
                  _openCamera();
                },
              ),
              ListTile(
                leading: const Icon(Icons.photo_library_outlined),
                title: const Text('Gallery'),
                onTap: () {
                  Navigator.of(sheetContext).pop();
                  _pickFile();
                },
              ),
            ],
          ),
        );
      },
    );
  }

  void _clearFile() {
    setState(() {
      _selectedFile = null;
    });
  }

  Widget _buildPresetList(bool isLoading) {
    return Consumer<AnnouncementProvider>(
      builder: (context, provider, _) {
        if (provider.isCategoriesLoading) {
          return const Padding(
            padding: EdgeInsets.symmetric(vertical: 16),
            child: Center(child: CircularProgressIndicator()),
          );
        }

        final error = provider.categoriesErrorMessage;
        if (error != null) {
          return Padding(
            padding: const EdgeInsets.symmetric(vertical: 12),
            child: Text(
              error,
              style: TextStyle(color: Colors.red.shade600, fontSize: 13),
            ),
          );
        }

        final categories = provider.categories;
        if (categories.isEmpty) {
          return Padding(
            padding: const EdgeInsets.symmetric(vertical: 12),
            child: Text(
              'No announcement categories available',
              style: TextStyle(color: Colors.grey.shade600, fontSize: 13),
            ),
          );
        }

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: categories.map((category) {
            final isSelected = _selectedCategory?.id == category.id;
            return Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: InkWell(
                onTap: isLoading ? null : () => _onSelectCategory(category),
                borderRadius: BorderRadius.circular(8),
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    vertical: 12,
                    horizontal: 16,
                  ),
                  decoration: BoxDecoration(
                    color: isSelected
                        ? const Color(0xFF003399).withValues(alpha: 0.08)
                        : Colors.transparent,
                    border: Border.all(
                      color: isSelected
                          ? const Color(0xFF003399)
                          : Colors.grey.shade300,
                      width: isSelected ? 1.5 : 1,
                    ),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        Icons.campaign_outlined,
                        size: 20,
                        color: isSelected
                            ? const Color(0xFF003399)
                            : Colors.grey.shade600,
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          category.title,
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w500,
                            color: isSelected
                                ? const Color(0xFF003399)
                                : Colors.grey.shade700,
                          ),
                        ),
                      ),
                      if (isSelected)
                        const Icon(
                          Icons.check_circle,
                          size: 20,
                          color: Color(0xFF003399),
                        ),
                    ],
                  ),
                ),
              ),
            );
          }).toList(),
        );
      },
    );
  }

  Widget _buildVehicleDropdown(bool isLoading) {
    return Consumer<VehicleProvider>(
      builder: (context, provider, _) {
        if (provider.isLoading) {
          return Container(
            padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
            decoration: BoxDecoration(
              border: Border.all(color: Colors.grey.shade300),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              children: [
                SizedBox(
                  width: 16,
                  height: 16,
                  child: CircularProgressIndicator(strokeWidth: 2),
                ),
                const SizedBox(width: 12),
                Text(
                  'Loading bus plates...',
                  style: TextStyle(color: Colors.grey.shade600, fontSize: 14),
                ),
              ],
            ),
          );
        }

        final error = provider.errorMessage;
        if (error != null) {
          return Padding(
            padding: const EdgeInsets.symmetric(vertical: 4),
            child: Text(
              error,
              style: TextStyle(color: Colors.red.shade600, fontSize: 13),
            ),
          );
        }

        final vehicles = provider.vehicles;

        return DropdownButtonFormField<VehicleModel>(
          initialValue: _selectedVehicle,
          isExpanded: true,
          decoration: InputDecoration(
            hintText: 'Select a bus plate',
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
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
          onChanged: isLoading ? null : _onSelectVehicle,
        );
      },
    );
  }

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    //passed value
    final isLoading = widget.isLoading;

    return Form(
      key: _formKey,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(4),
            decoration: BoxDecoration(
              color: Colors.grey.shade50,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              children: [
                _buildModeSegment(
                  label: 'Preset',
                  selected: !_isCustom,
                  value: false,
                ),
                _buildModeSegment(
                  label: 'Custom',
                  selected: _isCustom,
                  value: true,
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          if (!_isCustom) _buildPresetList(isLoading),
          if (_shouldShowVehicleDropdown) ...[
            const SizedBox(height: 16),
            const Text(
              'Bus Plate',
              style: TextStyle(fontWeight: FontWeight.w500, fontSize: 14),
            ),
            const SizedBox(height: 8),
            _buildVehicleDropdown(isLoading),
          ],
          if (_isCustom) ...[
            const Text(
              'Title',
              style: TextStyle(fontWeight: FontWeight.w500, fontSize: 14),
            ),
            const SizedBox(height: 8),
            TextFormField(
              controller: _titleController,
              validator: ValidationBuilder()
                  .minLength(1, 'Title is required')
                  .maxLength(80, 'Title is too long')
                  .build(),
              decoration: InputDecoration(
                hintText: 'Enter title',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 12,
                ),
              ),
            ),
            const SizedBox(height: 16),
            const Text(
              'Description',
              style: TextStyle(fontWeight: FontWeight.w500, fontSize: 14),
            ),
            const SizedBox(height: 8),
            TextFormField(
              controller: _descriptionController,
              maxLines: 4,
              validator: ValidationBuilder()
                  .minLength(1, 'Description is required')
                  .maxLength(500, 'Description is too long')
                  .build(),
              decoration: InputDecoration(
                hintText: 'Enter description',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                contentPadding: const EdgeInsets.all(12),
              ),
            ),
          ],
          const SizedBox(height: 16),
          const Text(
            'Attachment (Optional)',
            style: TextStyle(fontWeight: FontWeight.w500, fontSize: 14),
          ),
          const SizedBox(height: 8),
          InkWell(
            onTap: isLoading ? null : _showAttachmentOptions,
            borderRadius: BorderRadius.circular(8),
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
              decoration: BoxDecoration(
                border: Border.all(color: Colors.grey.shade300),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                children: [
                  Icon(
                    Icons.cloud_upload_outlined,
                    color: Colors.grey.shade600,
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      _selectedFile != null
                          ? _selectedFile!.name
                          : 'Add Attachment',
                      style: TextStyle(
                        color: Colors.grey.shade600,
                        fontSize: 14,
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  IconButton(
                    onPressed: _clearFile,
                    icon: const Icon(Icons.close, size: 20),
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(),
                    color: Colors.grey.shade600,
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
            decoration: BoxDecoration(
              color: Colors.transparent,
              border: Border.all(color: Colors.grey.shade300),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              children: [
                Icon(
                  Icons.push_pin_outlined,
                  color: Colors.grey.shade600,
                  size: 20,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    'Pin this announcement',
                    style: TextStyle(
                      color: Colors.grey.shade700,
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
                Switch(
                  value: _isPinned,
                  onChanged: isLoading ? null : (value) => _onTogglePin(value),
                  activeThumbColor: const Color(0xFF003399),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          SizedBox(
            width: double.infinity,
            child: CustomElevatedButton(
              onPressed: () => _handleSubmit(),
              text: 'Create Announcement',
              isLoading: isLoading,
            ),
          ),
        ],
      ),
    );
  }
}
