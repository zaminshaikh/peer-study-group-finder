// lib/widgets/filter_modal_sheet.dart

import 'package:flutter/material.dart';

class FilterModalSheet extends StatefulWidget {
  final Function(Map<String, dynamic>) onApplyFilters;
  final List<String> initialModalities;
  final int initialMaxSize;

  const FilterModalSheet({
    Key? key,
    required this.onApplyFilters,
    required this.initialModalities,
    required this.initialMaxSize,
  }) : super(key: key);

  @override
  _FilterModalSheetState createState() => _FilterModalSheetState();
}

class _FilterModalSheetState extends State<FilterModalSheet> {
  late List<String> selectedModalities;
  late double maxSize;

  @override
  void initState() {
    super.initState();
    selectedModalities = List<String>.from(widget.initialModalities);
    maxSize = widget.initialMaxSize.toDouble();
  }

  void _clearFilters() {
    setState(() {
      selectedModalities.clear();
      maxSize = 200; // Reset to default maximum size
    });
  }

  void _onModalityChanged(String modality, bool? isSelected) {
    if (isSelected != null) {
      setState(() {
        if (isSelected) {
          selectedModalities.add(modality);
        } else {
          selectedModalities.remove(modality);
        }
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Wrap(
      children: [
        const ListTile(
          title: Text(
            'Filter Options',
            style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
          ),
        ),
        CheckboxListTile(
          title: const Text('In Person'),
          value: selectedModalities.contains('In Person'),
          onChanged: (bool? value) {
            _onModalityChanged('In Person', value);
          },
        ),
        CheckboxListTile(
          title: const Text('Online'),
          value: selectedModalities.contains('Online'),
          onChanged: (bool? value) {
            _onModalityChanged('Online', value);
          },
        ),
        CheckboxListTile(
          title: const Text('Hybrid'),
          value: selectedModalities.contains('Hybrid'),
          onChanged: (bool? value) {
            _onModalityChanged('Hybrid', value);
          },
        ),
        ListTile(
          title: const Text('Max Group Size'),
          trailing: Text(maxSize.toInt().toString()),
        ),
        Slider(
          value: maxSize,
          min: 1,
          max: 200,
          divisions: 199,
          label: maxSize.toInt().toString(),
          onChanged: (double value) {
            setState(() {
              maxSize = value;
            });
          },
        ),
        Padding(
          padding: const EdgeInsets.all(16.0),
          child: Row(
            children: [
              Expanded(
                child: ElevatedButton(
                  onPressed: () {
                    widget.onApplyFilters({
                      'modalities': selectedModalities,
                      'maxSize': maxSize.toInt(),
                    });
                    Navigator.pop(context);
                  },
                  child: const Text('Apply Filters'),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: OutlinedButton(
                  onPressed: () {
                    _clearFilters();
                  },
                  child: const Text('Clear'),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}