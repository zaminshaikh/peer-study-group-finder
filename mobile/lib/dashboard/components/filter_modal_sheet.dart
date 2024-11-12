// lib/widgets/filter_modal_sheet.dart
import 'package:flutter/material.dart';

class FilterModalSheet extends StatefulWidget {
  final Function(Map<String, dynamic>) onApplyFilters;

  const FilterModalSheet({Key? key, required this.onApplyFilters}) : super(key: key);

  @override
  _FilterModalSheetState createState() => _FilterModalSheetState();
}

class _FilterModalSheetState extends State<FilterModalSheet> {
  List<String> selectedModalities = [];
  double maxSize = 200;

  @override
  Widget build(BuildContext context) {
    return Wrap(
      children: [
        ListTile(
          title: const Text('Filter Options', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
        ),
        CheckboxListTile(
          title: const Text('In-Person'),
          value: selectedModalities.contains('In-Person'),
          onChanged: (bool? value) {
            setState(() {
              _onModalityChanged('In-Person', value);
            });
          },
        ),
        CheckboxListTile(
          title: const Text('Online'),
          value: selectedModalities.contains('Online'),
          onChanged: (bool? value) {
            setState(() {
              _onModalityChanged('Online', value);
            });
          },
        ),
        CheckboxListTile(
          title: const Text('Hybrid'),
          value: selectedModalities.contains('Hybrid'),
          onChanged: (bool? value) {
            setState(() {
              _onModalityChanged('Hybrid', value);
            });
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
      ],
    );
  }

  void _onModalityChanged(String modality, bool? isSelected) {
    if (isSelected != null) {
      if (isSelected) {
        selectedModalities.add(modality);
      } else {
        selectedModalities.remove(modality);
      }
    }
  }
}