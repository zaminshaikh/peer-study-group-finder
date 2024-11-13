
import 'package:flutter/material.dart';
import 'package:mobile/models/study_group_model.dart';

class GroupCard extends StatelessWidget {
  final StudyGroup group;
  final bool isJoined; // Indicates if the user has joined the group
  final VoidCallback onTap;

  const GroupCard({
    Key? key,
    required this.group,
    required this.isJoined, // Add isJoined as a required parameter
    required this.onTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Stack(
        children: [
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
                      Icon(Icons.device_hub, size: 16),
                      const SizedBox(width: 4),
                      Text(
                        group.modality,
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                      const SizedBox(width: 16),
                      // Size
                      Icon(Icons.people, size: 16),
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
          // Check Mark Indicator
          if (isJoined)
            Positioned(
              top: 8,
              right: 24,
              child: Icon(
                Icons.check_circle,
                color: Colors.green,
              ),
            ),
        ],
      ),
    );
  }
}