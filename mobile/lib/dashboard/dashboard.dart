// lib/dashboard.dart
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:mobile/dashboard/components/create_group_sheet.dart';
import 'package:mobile/dashboard/components/filter_modal_sheet.dart';
import 'package:mobile/dashboard/components/group_details_sheet.dart';
import 'package:mobile/models/study_group_model.dart';
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class DashboardPage extends StatefulWidget {
  const DashboardPage({super.key});

  @override
  DashboardPageState createState() => DashboardPageState();
}

class DashboardPageState extends State<DashboardPage> {
  List<dynamic> groups = [];
  bool isLoading = true;
  int? userId;
  TextEditingController searchController = TextEditingController();
  List<dynamic> filteredGroups = [];
  Map<String, dynamic> selectedFilters = {};

  @override
  void initState() {
    super.initState();
    loadUserId();
  }

  Future<void> loadUserId() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    userId = prefs.getInt('userId');
    if (userId != null) {
      fetchGroups();
    } else {
      if (!mounted) return;
      Navigator.pushReplacementNamed(context, '/');
    }
  }

  Future<void> fetchGroups() async {
    setState(() => isLoading = true);

    try {
      final response = await http.post(
        Uri.parse('http://10.0.2.2:8000/api/searchgroups'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'UserId': userId,
          'Search': searchController.text, // Use search term if needed
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);

        // Fetch details for each group
        List<StudyGroup> groupDetails = [];

        for (var name in data['results']) {
          final groupResponse = await http.get(
            Uri.parse(
                'http://10.0.2.2:8000/api/getgroupdetails?name=${Uri.encodeComponent(name)}'),
            headers: {'Content-Type': 'application/json'},
          );

          if (groupResponse.statusCode == 200) {
            final groupData = jsonDecode(groupResponse.body);
            groupDetails.add(StudyGroup(
              id: name,
              name: name,
              description: groupData['Description'] ?? '',
              className: groupData['Class'] ?? '',
              size: groupData['Size'] ?? 0,
              modality: groupData['Modality'] ?? '',
              location: groupData['Location'],
              meetingTime: groupData['MeetingTime'],
              // createdAt: DateTime.parse(groupData['CreatedAt'] ?? ''), //TODO: Fix this
            ));
          } else {
            // Handle individual group fetch error if necessary
            continue;
          }
        }

        setState(() {
          groups = groupDetails;
          _applyFilters();
          isLoading = false;
        });
      } else {
        throw Exception('Failed to load groups');
      }
    } catch (e) {
      if (!mounted) return;
      setState(() {
        isLoading = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('An error occurred: $e')),
      );
    }
  }
  
  void _applyFilters() {
    setState(() {
      filteredGroups = groups.where((group) {
        final matchesSearch = group.name
            .toLowerCase()
            .contains(searchController.text.toLowerCase());
        final matchesModality = selectedFilters['modalities'] == null ||
            selectedFilters['modalities'].isEmpty ||
            selectedFilters['modalities'].contains(group.modality);
        final matchesSize = group.size <= (selectedFilters['maxSize'] ?? 200);
  
        return matchesSearch && matchesModality && matchesSize;
      }).toList();
    });
  }

  void _showFilterModal() {
    showModalBottomSheet(
      context: context,
      builder: (_) => FilterModalSheet(
        onApplyFilters: (filters) {
          setState(() {
            selectedFilters = filters;
            _applyFilters();
          });
        },
      ),
    );
  }

  void _showCreateGroup() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (_) => const CreateGroupSheet(),
    ).then((_) {
      fetchGroups();
    });
  }

  void _showGroupDetails(String groupId) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (_) => GroupDetailsSheet(groupId: groupId),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Study Groups'),
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list),
            onPressed: _showFilterModal,
          ),
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: _showCreateGroup,
          ),
        ],
      ),
      body: Column(
        children: [
          // Search Bar
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: TextField(
              controller: searchController,
              decoration: InputDecoration(
                hintText: 'Search Groups...',
                prefixIcon: const Icon(Icons.search),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              onChanged: (value) {
                _applyFilters();
              },
            ),
          ),
          // Groups List
          Expanded(
            child: isLoading
                ? const Center(child: CircularProgressIndicator())
                : ListView.builder(
                  itemCount: filteredGroups.length,
                  itemBuilder: (context, index) {
                    final group = filteredGroups[index];
                    return ListTile(
                      title: Text(group.name),
                      subtitle: Text(group.className),
                      onTap: () {
                        _showGroupDetails(group.id);
                      },
                    );
                  },
                )
          ),
        ],
      ),
    );
  }
}