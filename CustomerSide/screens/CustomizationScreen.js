import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useFonts as useMontserrat, Montserrat_400Regular, Montserrat_600SemiBold } from "@expo-google-fonts/montserrat";
import { LeagueSpartan_700Bold } from "@expo-google-fonts/league-spartan";

export default function CustomizationScreen() {
    const navigation = useNavigation();
    const [roomType, setRoomType] = useState('');
    const [size1, setSize1] = useState('');
    const [size2, setSize2] = useState('');
    const [frameStyle, setFrameStyle] = useState('');
    const [addOns, setAddOns] = useState('');

    const [montserratLoaded] = useMontserrat({ Montserrat_400Regular, Montserrat_600SemiBold });
    const [leagueSpartanLoaded] = useMontserrat({ LeagueSpartan_700Bold });

    if (!montserratLoaded || !leagueSpartanLoaded) {
        return null;
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="chevron-left" size={28} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Customization</Text>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView contentContainerStyle={styles.contentContainer}>
                {/* Room Type */}
                <Text style={styles.label}>Room Type</Text>
                <TextInput
                    style={styles.input}
                    placeholder=""
                    value={roomType}
                    onChangeText={setRoomType}
                />

                {/* Size */}
                <Text style={styles.label}>Size</Text>
                <View style={styles.sizeContainer}>
                    <TextInput
                        style={[styles.input, styles.sizeInput]}
                        placeholder=""
                        keyboardType="numeric"
                        value={size1}
                        onChangeText={setSize1}
                    />
                    <Text style={styles.sizeDivider}>x</Text>
                    <TextInput
                        style={[styles.input, styles.sizeInput]}
                        placeholder=""
                        keyboardType="numeric"
                        value={size2}
                        onChangeText={setSize2}
                    />
                </View>

                {/* Frame Style */}
                <Text style={styles.label}>Frame Style</Text>
                <TextInput
                    style={styles.input}
                    placeholder=""
                    value={frameStyle}
                    onChangeText={setFrameStyle}
                />

                {/* Add-ons */}
                <Text style={styles.label}>Add-ons</Text>
                <TextInput
                    style={[styles.input, styles.addOnsInput]}
                    placeholder=""
                    multiline
                    textAlignVertical="top"
                    value={addOns}
                    onChangeText={setAddOns}
                />

                {/* Continue Button */}
                <TouchableOpacity style={styles.continueButton}>
                    <Text style={styles.continueButtonText}>Continue</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 15,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    headerTitle: {
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 22,
        color: '#000',
    },
    contentContainer: {
        padding: 20,
    },
    label: {
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 16,
        color: '#000',
        marginBottom: 8,
    },
    input: {
        width: '100%',
        height: 50,
        backgroundColor: '#F3EFE9',
        borderRadius: 10,
        paddingHorizontal: 15,
        marginBottom: 20,
        fontFamily: 'Montserrat_400Regular',
    },
    sizeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    sizeInput: {
        flex: 1,
        marginRight: 10,
    },
    sizeDivider: {
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 20,
        color: '#777',
        marginHorizontal: 5,
    },
    addOnsInput: {
        height: 120,
        paddingTop: 15,
    },
    continueButton: {
        backgroundColor: '#A68B69',
        paddingVertical: 15,
        alignItems: 'center',
        borderRadius: 10,
        marginTop: 30,
    },
    continueButtonText: {
        color: '#fff',
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 18,
    },
});
