import React, { useState } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  I18nManager,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import Logo from "../../Assests/logos/dclass.png";
import COLORS from "../../styles/colors";

const LibraryHeader = () => {
  const [searchVisible, setSearchVisible] = useState(false);

  const toggleSearch = () => {
    setSearchVisible(!searchVisible);
  };

  return (
    <View style={[styles.headerContainer, { direction: "ltr" }]}>
      <View style={[styles.headerContent, { direction: "ltr" }]}>
        <Image source={Logo} style={styles.logo} resizeMode="contain" />

        <TouchableOpacity
          style={styles.searchIconContainer}
          onPress={toggleSearch}
        >
          <Icon name="search" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logo: {
    width: 100,
    height: 40,
  },
  searchIconContainer: {
    padding: 8,
    backgroundColor: COLORS.grey,
    borderRadius: 50,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default LibraryHeader;
