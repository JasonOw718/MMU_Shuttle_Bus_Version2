import 'package:flutter/material.dart';

class AnnouncementPreset {
  final String key;
  final String label;
  final IconData icon;
  final String title;
  final String description;

  const AnnouncementPreset({
    required this.key,
    required this.label,
    required this.icon,
    required this.title,
    required this.description,
  });
}

const List<AnnouncementPreset> announcementPresets = [
  AnnouncementPreset(
    key: 'bus_delayed',
    label: 'Bus Delayed',
    icon: Icons.access_time,
    title: 'Bus Delayed',
    description:
        'The shuttle bus is currently delayed. Please bear with us, we will arrive as soon as possible.',
  ),
  AnnouncementPreset(
    key: 'bus_full',
    label: 'Bus Full',
    icon: Icons.people_alt_outlined,
    title: 'Bus Full',
    description:
        'The shuttle bus is at full capacity. Please wait for the next available bus.',
  ),
  AnnouncementPreset(
    key: 'bus_breakdown',
    label: 'Bus Breakdown',
  icon: Icons.build_outlined,
    title: 'Bus Breakdown',
    description:
        'The shuttle bus has experienced a breakdown. We are working on a replacement and apologise for the inconvenience.',
  ),
];
