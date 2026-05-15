import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:mmu_shuttle_driver/core/utils/date.dart';
import 'package:mmu_shuttle_driver/core/widgets/error_label.dart';
import 'package:mmu_shuttle_driver/core/widgets/header.dart';
import 'package:mmu_shuttle_driver/features/announcement/providers/announcement_provider.dart';
import 'package:mmu_shuttle_driver/features/announcement/widgets/announcement_card.dart';
import 'package:mmu_shuttle_driver/features/announcement/widgets/toggle_pin_confirmation_dialog.dart';
import 'package:mmu_shuttle_driver/features/announcement/widgets/create_announcement_dialog.dart';
import 'package:mmu_shuttle_driver/core/widgets/custom_floating_button.dart';
import 'package:provider/provider.dart';

class AnnouncementScreen extends StatefulWidget {
  const AnnouncementScreen({super.key});

  @override
  State<AnnouncementScreen> createState() => _AnnouncementScreenState();
}

class _AnnouncementScreenState extends State<AnnouncementScreen> {
  //methods
  Future<void> _onTogglePin(BuildContext context, int id) async {
    //initiate variables
    final announcementProvider = context.read<AnnouncementProvider>();

    await announcementProvider.togglePin(id);
  }

  void _onView(BuildContext context, String fileName) {
    context.push('/view-file', extra: fileName);
  }

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      if (mounted) {
        context.read<AnnouncementProvider>().fetchAnnouncements();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(25, 20, 25, 0),
              child: HeaderWidget(
                title: 'Announcements',
                subtitle: 'Manage and create announcements',
              ),
            ),
            const SizedBox(height: 25),
            Expanded(
              child: RefreshIndicator(
                onRefresh: () =>
                    context.read<AnnouncementProvider>().fetchAnnouncements(),
                child: Consumer<AnnouncementProvider>(
                  builder: (context, announcementProvider, child) {
                    //pass values
                    final announcements = announcementProvider.announcements;
                    final isLoading = announcementProvider.isLoading;
                    final errorMessage = announcementProvider.errorMessage;

                    return LayoutBuilder(
                      builder: (context, constraints) {
                        Widget body;

                        if (isLoading == true) {
                          body = const Center(
                            child: CircularProgressIndicator(),
                          );
                        } else if (errorMessage != null) {
                          body = Center(
                            child: ErrorLabelWidget(
                              errorMessage: errorMessage,
                              onRetry: () {
                                context
                                    .read<AnnouncementProvider>()
                                    .fetchAnnouncements();
                              },
                            ),
                          );
                        } else if (announcements.isEmpty) {
                          body = Center(
                            child: Text(
                              'No announcements found',
                              style: TextStyle(
                                fontSize: 16,
                                color: Colors.grey[600],
                              ),
                            ),
                          );
                        } else {
                          body = Column(
                            children: announcements.map((announcement) {
                              return Column(
                                children: [
                                  AnnouncementCardWidget(
                                    title: announcement.title,
                                    description: announcement.description,
                                    createdAt: formatAnnouncementDate(
                                      announcement.createdAt.toString(),
                                    ),
                                    isPinned: announcement.isPinned,
                                    fileName: announcement.fileName,
                                    busPlate: announcement.busPlate,
                                    onTogglePin: () => showDialog(
                                      context: context,
                                      builder: (context) =>
                                          TogglePinConfirmationDialog(
                                            isPinned: announcement.isPinned,
                                            onTogglePin: () => _onTogglePin(
                                              context,
                                              announcement.id,
                                            ),
                                          ),
                                    ),
                                    onView: announcement.fileName != null
                                        ? () => _onView(
                                            context,
                                            announcement.fileName!,
                                          )
                                        : null,
                                  ),
                                  const SizedBox(height: 10),
                                ],
                              );
                            }).toList(),
                          );
                        }

                        return SingleChildScrollView(
                          physics: const AlwaysScrollableScrollPhysics(),
                          padding: const EdgeInsets.fromLTRB(25, 0, 25, 100),
                          child: ConstrainedBox(
                            constraints: BoxConstraints(
                              minHeight: constraints.maxHeight,
                            ),
                            child: body,
                          ),
                        );
                      },
                    );
                  },
                ),
              ),
            ),
          ],
        ),
        Positioned(
          bottom: 20,
          right: 20,
          child: CustomAddButton(
            onPressed: () {
              showDialog(
                context: context,
                builder: (context) => CreateAnnouncementDialog(),
              );
            },
          ),
        ),
      ],
    );
  }
}
