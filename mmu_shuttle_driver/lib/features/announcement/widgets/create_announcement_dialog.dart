import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:mmu_shuttle_driver/core/utils/toast.dart';
import 'package:mmu_shuttle_driver/features/announcement/providers/announcement_provider.dart';
import 'package:mmu_shuttle_driver/features/announcement/widgets/create_announcement_form.dart';
import 'package:mmu_shuttle_driver/features/announcement/widgets/header.dart';
import 'package:provider/provider.dart';

class CreateAnnouncementDialog extends StatefulWidget {
  final bool isFromLiveRide;

  const CreateAnnouncementDialog({super.key, this.isFromLiveRide = false});

  @override
  State<CreateAnnouncementDialog> createState() =>
      _CreateAnnouncementDialogState();
}

class _CreateAnnouncementDialogState extends State<CreateAnnouncementDialog> {
  bool _isLoading = false;

  //methods
  Future<void> _onSubmit(
    BuildContext context,
    String title,
    String description,
    bool isPinned,
    int? vehicleId,
    PlatformFile? uploadedFile,
  ) async {
    try {
      setState(() {
        _isLoading = true;
      });

      //initiate variables
      final announcementProvider = context.read<AnnouncementProvider>();

      await announcementProvider.createAnnouncement(
        title: title,
        description: description,
        isPinned: isPinned,
        vehicleId: vehicleId,
        uploadedFile: uploadedFile,
      );

      showSuccessToast(context, "Announcement created successfully");
      if (context.mounted) {
        Navigator.pop(context);
      }
    } catch (e) {
      showErrorToast(context, e.toString());
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              HeaderWidget(title: 'Create Announcement', isLoading: _isLoading),
              const SizedBox(height: 24),
              CreateAnnouncementForm(
                isFromLiveRide: widget.isFromLiveRide,
                onSubmitted:
                    (title, description, isPinned, vehicleId, uploadedFile) =>
                        _onSubmit(
                          context,
                          title,
                          description,
                          isPinned,
                          vehicleId,
                          uploadedFile,
                        ),
                isLoading: _isLoading,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
