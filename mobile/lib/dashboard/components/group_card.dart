// group_card.dart

import 'package:flutter/material.dart';
import 'package:mobile/models/study_group_model.dart';

class GroupCard extends StatelessWidget {
  final StudyGroup group;
  final bool isJoined; // Indicates if the user has joined the group
  final bool isOwner;  // Indicates if the user owns the group
  final VoidCallback onTap;

  const GroupCard({
    Key? key,
    required this.group,
    required this.isJoined,
    required this.isOwner,
    required this.onTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Stack(
        children: [
          // The card containing group information
          Card(
            margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16), // Rounded corners
            ),
            elevation: 4,
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Group Name
                  Text(
                    group.name,
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  const SizedBox(height: 8),
                  // Class Name
                  Text(
                    'Class: ${group.className}',
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                  const SizedBox(height: 8),
                  // Modality and Size Row
                  Row(
                    children: [
                      // Modality
                      const Icon(Icons.device_hub, size: 16),
                      const SizedBox(width: 4),
                      Text(
                        group.modality,
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                      const SizedBox(width: 16),
                      // Size
                      const Icon(Icons.people, size: 16),
                      const SizedBox(width: 4),
                      Text(
                        'Size: ${group.size}',
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
          // Icons aligned to the right
          Positioned(
            top: 8,
            right: 24,
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (isOwner)
                  Image.asset(
                    'assets/crown_icon.png',
                    width: 24,
                    height: 24,
                  ),
                if (isOwner && isJoined)
                  const SizedBox(width: 8), // Spacing between icons
                if (isJoined)
                  const Icon(
                    Icons.check_circle,
                    color: Colors.green,
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}