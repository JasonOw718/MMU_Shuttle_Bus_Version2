import 'package:flutter/material.dart';
import 'package:mmu_shuttle_driver/features/announcement/widgets/pin.dart';
import 'package:mmu_shuttle_driver/features/announcement/widgets/view_file.dart';

class AnnouncementCardWidget extends StatelessWidget {
  final String title;
  final String description;
  final String createdAt;
  final bool isPinned;
  final String? fileName;
  final String busPlate;
  final VoidCallback onTogglePin;
  final VoidCallback? onView;

  const AnnouncementCardWidget({
    super.key,
    required this.title,
    required this.description,
    required this.createdAt,
    required this.isPinned,
    required this.fileName,
    required this.busPlate,
    required this.onTogglePin,
    required this.onView,
  });

  @override
  Widget build(BuildContext context) {
    final borderColor = isPinned ? Colors.orange : Colors.blue;
    final leftIcon = isPinned ? Icons.push_pin : Icons.info_outline;
    final leftIconColor = isPinned ? Colors.orange : Colors.blue;
    final rightIcon = isPinned ? Icons.campaign : null;
    final backgroundColor = isPinned ? Colors.orange.shade50 : Colors.white;

    return Container(
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.08),
            spreadRadius: 0,
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: IntrinsicHeight(
        child: Stack(
          children: [
            Row(
              children: [
                Container(
                  width: 5,
                  decoration: BoxDecoration(
                    color: borderColor,
                    borderRadius: const BorderRadius.only(
                      topLeft: Radius.circular(16),
                      bottomLeft: Radius.circular(16),
                    ),
                  ),
                ),
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(20, 18, 20, 18),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Icon(leftIcon, size: 22, color: leftIconColor),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Text(
                                title,
                                style: const TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.w600,
                                  color: Color(0xFF1A1A1A),
                                ),
                              ),
                            ),
                            if (isPinned) ...[
                              const SizedBox(width: 8),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 12,
                                  vertical: 4,
                                ),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFFFC107),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: const Text(
                                  'Pinned',
                                  style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w600,
                                    color: Colors.white,
                                  ),
                                ),
                              ),
                            ],
                            if (rightIcon != null) ...[
                              const SizedBox(width: 8),
                              Icon(rightIcon, size: 24, color: leftIconColor),
                            ],
                          ],
                        ),
                        const SizedBox(height: 12),
                        Text(
                          description,
                          style: const TextStyle(
                            fontSize: 15,
                            color: Color(0xFF1A1A1A),
                            fontWeight: FontWeight.w400,
                            height: 1.4,
                          ),
                        ),
                        const SizedBox(height: 12),
                        if (fileName != null) ...[
                          ViewFileWidget(fileName: fileName!, onView: onView),
                          const SizedBox(height: 25),
                        ],
                        Row(
                          children: [
                            if (busPlate.isNotEmpty) ...[
                              Icon(
                                Icons.directions_bus_outlined,
                                size: 14,
                                color: Colors.grey[600],
                              ),
                              const SizedBox(width: 6),
                              Text(
                                busPlate,
                                style: TextStyle(
                                  fontSize: 13,
                                  color: Colors.grey[600],
                                  fontWeight: FontWeight.w400,
                                ),
                              ),
                              Padding(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 6,
                                ),
                                child: Text(
                                  '·',
                                  style: TextStyle(
                                    fontSize: 13,
                                    color: Colors.grey[400],
                                  ),
                                ),
                              ),
                            ],
                            Text(
                              createdAt,
                              style: TextStyle(
                                fontSize: 13,
                                color: Colors.grey[600],
                                fontWeight: FontWeight.w400,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
            PinWidget(isPinned: isPinned, onTap: onTogglePin),
          ],
        ),
      ),
    );
  }
}
