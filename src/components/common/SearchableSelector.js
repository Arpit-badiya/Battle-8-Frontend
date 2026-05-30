/**
 * SearchableSelector — reusable, mobile-friendly searchable select component.
 *
 * Props:
 *   label          string   — field label shown above the trigger button
 *   value          string   — display value for the trigger (single-select)
 *   placeholder    string   — placeholder when nothing is selected
 *   options        string[] — full list of option strings
 *   onSelect       fn(option: string) — called when an option is tapped
 *   multi          bool     — enable multi-select mode
 *   selectedValues string[] — currently selected values (multi mode)
 *   emptyText      string   — shown when filtered list is empty
 *   disabled       bool     — disables the trigger
 */

import { Ionicons } from '@expo/vector-icons';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../../constants/colors';
import spacing from '../../constants/spacing';

const ITEM_HEIGHT = 48;

const SearchableSelector = ({
  label,
  value,
  placeholder = 'Select',
  options = [],
  onSelect,
  multi = false,
  selectedValues = [],
  emptyText = 'No items found.',
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((opt) => opt.toLowerCase().includes(q));
  }, [options, query]);

  const handleOpen = useCallback(() => {
    if (disabled) return;
    setQuery('');
    setOpen(true);
  }, [disabled]);

  const handleClose = useCallback(() => {
    setOpen(false);
    setQuery('');
  }, []);

  const handleSelect = useCallback(
    (option) => {
      onSelect(option);
      if (!multi) {
        handleClose();
      }
    },
    [handleClose, multi, onSelect]
  );

  const getItemLayout = useCallback(
    (_, index) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index }),
    []
  );

  const renderItem = useCallback(
    ({ item }) => {
      const selected = multi ? selectedValues.includes(item) : value === item;
      return (
        <Pressable
          onPress={() => handleSelect(item)}
          style={[styles.option, selected && styles.optionActive]}
        >
          <Text numberOfLines={1} style={[styles.optionText, selected && styles.optionTextActive]}>
            {item}
          </Text>
          {selected && (
            <Ionicons
              name={multi ? 'checkmark-circle' : 'checkmark'}
              size={18}
              color={colors.primary}
            />
          )}
        </Pressable>
      );
    },
    [handleSelect, multi, selectedValues, value]
  );

  const hasValue = multi ? selectedValues.length > 0 : Boolean(value);

  return (
    <View style={styles.wrapper}>
      {!!label && <Text style={styles.label}>{label}</Text>}

      {/* Trigger button */}
      <Pressable
        onPress={handleOpen}
        disabled={disabled}
        style={[styles.trigger, disabled && styles.triggerDisabled]}
      >
        <Text
          numberOfLines={1}
          style={[styles.triggerText, !hasValue && styles.triggerPlaceholder]}
        >
          {hasValue ? value || placeholder : placeholder}
        </Text>
        <Ionicons
          name="chevron-down"
          size={16}
          color={disabled ? colors.textDim : colors.primary}
        />
      </Pressable>

      {/* Full-screen modal */}
      <Modal
        visible={open}
        animationType="slide"
        transparent
        onRequestClose={handleClose}
        onShow={() => {
          // Auto-focus search input after modal opens
          setTimeout(() => inputRef.current?.focus(), 120);
        }}
      >
        <View style={styles.overlay}>
          <Pressable style={styles.backdrop} onPress={handleClose} />

          <SafeAreaView edges={['bottom']} style={styles.sheet}>
            {/* Sheet header */}
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{label || placeholder}</Text>
              <Pressable onPress={handleClose} hitSlop={12} style={styles.closeBtn}>
                <Ionicons name="close" size={22} color={colors.text} />
              </Pressable>
            </View>

            {/* Search input */}
            <View style={styles.searchRow}>
              <Ionicons name="search" size={16} color={colors.textMuted} style={styles.searchIcon} />
              <TextInput
                ref={inputRef}
                value={query}
                onChangeText={setQuery}
                placeholder="Search..."
                placeholderTextColor={colors.textDim}
                style={styles.searchInput}
                autoCorrect={false}
                autoCapitalize="none"
                returnKeyType="search"
              />
              {query.length > 0 && (
                <Pressable onPress={() => setQuery('')} hitSlop={8}>
                  <Ionicons name="close-circle" size={16} color={colors.textMuted} />
                </Pressable>
              )}
            </View>

            {/* Multi-select count badge */}
            {multi && selectedValues.length > 0 && (
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{selectedValues.length} selected</Text>
              </View>
            )}

            {/* Options list */}
            <FlatList
              data={filtered}
              keyExtractor={(item) => item}
              renderItem={renderItem}
              getItemLayout={getItemLayout}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              initialNumToRender={14}
              maxToRenderPerBatch={14}
              windowSize={5}
              ListEmptyComponent={
                <Text style={styles.emptyText}>{emptyText}</Text>
              }
              contentContainerStyle={styles.listContent}
            />

            {/* Done button for multi-select */}
            {multi && (
              <Pressable onPress={handleClose} style={styles.doneBtn}>
                <Text style={styles.doneBtnText}>Done</Text>
              </Pressable>
            )}
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    minWidth: 0,
  },
  label: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
    marginBottom: spacing.xs,
  },
  trigger: {
    minHeight: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  triggerDisabled: {
    opacity: 0.5,
  },
  triggerText: {
    flex: 1,
    color: colors.text,
    fontSize: 13,
    fontWeight: '900',
  },
  triggerPlaceholder: {
    color: colors.textDim,
    fontWeight: '800',
  },
  // Modal overlay
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.72)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    backgroundColor: '#0a1318',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderColor: colors.borderSoft,
    maxHeight: '80%',
    minHeight: 320,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  sheetTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
    flex: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
    minHeight: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  searchIcon: {
    flexShrink: 0,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
    paddingVertical: spacing.sm,
  },
  countBadge: {
    alignSelf: 'flex-start',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    backgroundColor: 'rgba(85,255,23,0.14)',
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  countText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '900',
  },
  listContent: {
    paddingBottom: spacing.md,
  },
  option: {
    height: ITEM_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
    gap: spacing.sm,
  },
  optionActive: {
    backgroundColor: 'rgba(85,255,23,0.10)',
  },
  optionText: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
  },
  optionTextActive: {
    color: colors.primary,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  doneBtn: {
    margin: spacing.lg,
    marginTop: spacing.sm,
    minHeight: 46,
    borderRadius: 10,
    backgroundColor: colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  doneBtnText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
});

export default SearchableSelector;
