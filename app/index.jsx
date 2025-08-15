import { Image, StyleSheet, Text, TouchableOpacity, View, Dimensions } from "react-native";
import React, { useState, useRef } from "react";
import { useRouter } from "expo-router";
import { ScrollView } from "react-native";

const { width } = Dimensions.get('window');

const onboardingData = [
  {
    id: 1,
    image: require("../assets/images/onboardingImg01.png"),
    title: "Ride Easy, Ride Smart",
    subtitle: "Your seamless solution for bus bookings and private hires - fast, flexible, and reliable."
  },
  {
    id: 2,
    image: require("../assets/images/onboardingImg01.png"), // You can replace with different images
    title: "Book Your Journey",
    subtitle: "Find and book the perfect bus for your trip with just a few taps. Compare routes, times, and prices."
  },
  {
    id: 3,
    image: require("../assets/images/onboardingImg01.png"), // You can replace with different images
    title: "Private Hire Made Simple",
    subtitle: "Need a private bus? Our hiring service makes it easy to get the perfect vehicle for your group."
  }
];

export default function Index() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef(null);

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      scrollViewRef.current?.scrollTo({ x: nextIndex * width, animated: true });
    } else {
      router.push('/auth/Login');
    }
  };

  const handleSkip = () => {
    router.push('/auth/Login');
  };

  const handleScroll = (event) => {
    const scrollX = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollX / width);
    setCurrentIndex(index);
  };

  const renderOnboardingScreen = (item) => (
    <View key={item.id} style={styles.screenContainer}>
      <Image style={styles.img} source={item.image} />
      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Skip Button */}
      <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Onboarding Screens */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {onboardingData.map(renderOnboardingScreen)}
      </ScrollView>

      {/* Bottom Section */}
      <View style={styles.bottomContainer}>
        {/* Page Indicators */}
        <View style={styles.indicatorContainer}>
          {onboardingData.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                currentIndex === index ? styles.activeIndicator : styles.inactiveIndicator
              ]}
            />
          ))}
        </View>

        {/* Navigation Button */}
        <TouchableOpacity onPress={handleNext} style={styles.button}>
          <Text style={styles.buttonText}>
            {currentIndex === onboardingData.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  skipButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  scrollView: {
    flex: 1,
  },
  screenContainer: {
    width: width,
    flex: 1,
  },
  img: {
    width: "100%",
    height: "65%",
    resizeMode: "cover",
  },
  textContainer: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 20,
    marginTop: -25, // overlap a little with the image
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    shadowColor: "#011a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 7,
    elevation: 5, // for Android shadow
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    color: "gray",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 20,
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  indicatorContainer: {
    flexDirection: "row",
    marginBottom: 30,
  },
  indicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  activeIndicator: {
    backgroundColor: "#e66119",
  },
  inactiveIndicator: {
    backgroundColor: "#ddd",
  },
  button: {
    backgroundColor: "#e66119",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 10,
    minWidth: 120,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});


