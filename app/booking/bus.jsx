import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function Bus() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Parse the passed parameters
  const routes = params.routes ? JSON.parse(params.routes) : [];
  const searchParams = params.searchParams
    ? JSON.parse(params.searchParams)
    : {};

    console.log("Getting the routes" ,routes)

  // Extract search parameters
  const { fromLocation, toLocation, departureDate, returnDate, tripType } =
    searchParams;

// Map backend data to match the UI structure (adjust based on actual backend response)
const busData = routes.map((route, index) => ({
    id: route.bus._id || index + 1, 
    routeId: route._id, // Add the actual route ID here!
    name: route.bus.busNumber || "AKTC", 
    logo: require("../../assets/images/bus.png"), 
    type: route.type || route.bus.type || "Non-Ac", 
    depart: route.departureTime || "N/A", 
    arrive: route.arrivalTime || "N/A", 
    duration: route.estimatedDuration || "N/A", 
    seatsLeft: route.availability.availableSeats || 0, 
    price: route.fare.total ? `₦${route.fare.total}` : "N/A", 
    color: index % 3 === 0 ? "bg-[#ffe8e0]" : index % 3 === 1 ? "bg-[#e3ecff]" : "bg-[#fce4ec]", 
  }));

  return (
    <View className="flex-1 bg-white px-4 pt-10">
      {/* From / To Locations */}
      <View className="flex-row justify-between items-center mb-4">
        <View>
          <Text className="text-black text-xl font-bold">
            {fromLocation || "Unknown"}
          </Text>
          <Text className="text-gray-600">
            {fromLocation ? `${fromLocation} Terminal` : "N/A"}
          </Text>
        </View>
        <Feather name="repeat" size={20} color="black" />
        <View className="items-end">
          <Text className="text-black text-xl font-bold">
            {toLocation || "Unknown"}
          </Text>
          <Text className="text-gray-600">
            {toLocation ? `${toLocation} Central Park` : "N/A"}
          </Text>
        </View>
      </View>

      {/* Trip Type and Dates */}
      <View className="mb-4">
        <View className="flex-row items-center justify-center mb-2">
          <Text className="text-sm font-medium text-gray-600 mr-2">Trip Type:</Text>
          <View className={`px-3 py-1 rounded-full ${
            tripType === "roundtrip" ? "bg-orange-100" : "bg-blue-100"
          }`}>
            <Text className={`text-sm font-semibold ${
              tripType === "roundtrip" ? "text-orange-600" : "text-blue-600"
            }`}>
              {tripType === "roundtrip" ? "Round Trip" : "One Way"}
            </Text>
          </View>
        </View>
        
        <View className="flex-row justify-between">
          <View className="flex-1 mr-2 bg-gray-100 p-3 rounded-xl">
            <Text className="text-gray-600">Departure</Text>
            <Text className="text-black font-semibold">
              {departureDate ? new Date(departureDate).toDateString() : "N/A"}
            </Text>
          </View>
          {tripType === "roundtrip" && (
            <View className="flex-1 ml-2 bg-gray-100 p-3 rounded-xl">
              <Text className="text-gray-600">Return</Text>
              <Text className="text-black font-semibold">
                {returnDate ? new Date(returnDate).toDateString() : "N/A"}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Bus List */}
      <ScrollView>
        {busData.length === 0 ? (
          <View className="flex-1 justify-center items-center mt-10">
            <Text className="text-gray-500 text-lg">No buses found</Text>
            <Text className="text-gray-400 text-sm">
              Try adjusting your search
            </Text>
          </View>
        ) : (
          busData.map((bus) => (
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/booking/busDetails",
                  params: { 
                    bus: JSON.stringify(bus),
                    searchParams: params.searchParams // Pass search parameters to bus details
                  },
                })
              }
              key={bus.id}
              className={`rounded-2xl mt-6 p-6 ${bus.color} shadow-sm`}
            >
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center space-x-2">
                  <Image
                    style={{ resizeMode: "contain" }}
                    source={bus.logo}
                    className="w-24 h-20"
                  />
                </View>
                <Text className="text-gray-700">{bus.type}</Text>
              </View>

              <View className="flex-row justify-between items-center mt-2">
                <View className="items-center">
                  <Text className="text-black text-lg">{bus.depart}</Text>
                  <Text>Depart</Text>
                </View>
                <View className="items-center">
                  <Feather name="more-horizontal" size={20} color="gray" />
                  <View className="w-10 h-10 absolute -top-36 bg-white rounded-full -mb-2" />
                  <View className="w-10 h-10 absolute top-16 bg-white rounded-full -mb-2" />
                  <Text className="text-gray-600 text-xs">{bus.duration}</Text>
                </View>
                <View className="items-center">
                  <Text className="text-black text-lg">{bus.arrive}</Text>
                  <Text>Arrive</Text>
                </View>
              </View>

              <View className="flex-row justify-between mt-3">
                <Text className="text-gray-700 text-sm">
                  {bus.seatsLeft} seats left
                </Text>
                <View className="items-end">
                  <Text className="text-red-600 font-semibold">
                    {bus.price}/<Text className="text-xs">person</Text>
                  </Text>
                  {tripType === "roundtrip" && (
                    <Text className="text-xs text-orange-600 font-medium">
                      Round trip pricing
                    </Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}
