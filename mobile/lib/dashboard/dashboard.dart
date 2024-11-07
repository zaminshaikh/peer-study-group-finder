import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class DashboardPage extends StatefulWidget {
  const DashboardPage({Key? key}) : super(key: key);

  @override
  _DashboardPageState createState() => _DashboardPageState();
}

class _DashboardPageState extends State<DashboardPage> {
  List<dynamic> groups = [];

  @override
  void initState() {
    super.initState();
    fetchGroups();
  }

  void fetchGroups() async {
    final response = await http.post(
      Uri.parse('http://10.0.2.2:8000/api/searchgroups'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'UserId': 'your-user-id', 'Search': ''}),
    );

    if (response.statusCode == 200) {
      setState(() {
        groups = jsonDecode(response.body)['results'];
      });
    } else {
      // Handle error
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Study Groups')),
      body: ListView.builder(
        itemCount: groups.length,
        itemBuilder: (context, index) {
          return ListTile(
            title: Text(groups[index]['Name']),
            subtitle: Text(groups[index]['Class']),
            onTap: () {
              // Navigate to group details
            },
          );
        },
      ),
    );
  }
}