import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Mapbox, { MapView } from "@rnmapbox/maps";
import { Controller, useForm } from "react-hook-form";
import {
  requestForegroundPermissionsAsync,
  getCurrentPositionAsync,
  LocationObject,
  watchPositionAsync,
  LocationAccuracy,
} from "expo-location";
import { useEffect, useState } from "react";

Mapbox.setAccessToken(
  "sk.eyJ1IjoibWF0aHJtbSIsImEiOiJjbGszNWR6cGkwOGtpM2VxcGlzaG1icm1mIn0.xBN32ROMjgMD5zF9ytbvzw"
);

interface Form {
  search: string;
}

fetch("http://192.168.0.55:5050/")
.then((response) => response.json())
.then((json) => console.log(json));

export default function App() {
  const [location, setLocation] = useState({
    lat: 0,
    lng: 0,
  });

  const [button, setButton] = useState(false)

  async function requestLocationPermissions() {
    const { granted } = await requestForegroundPermissionsAsync();

    if (granted) {
      const currentPosition = await getCurrentPositionAsync();
      setLocation({
        lat: currentPosition.coords.latitude,
        lng: currentPosition.coords.longitude,
      });
    }
  }

  useEffect(() => {
    requestLocationPermissions();
  }, []);

  useEffect(() => {
    watchPositionAsync(
      {
        accuracy: LocationAccuracy.Highest,
        timeInterval: 1000,
        distanceInterval: 1,
      },
      (response) => {
        setLocation({
          lat: response.coords.latitude,
          lng: response.coords.longitude,
        });
      }
    );
  }, [button]);

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<Form>({
    defaultValues: {
      search: "",
    },
  });

  function handleSearch(data: Form) {
    fetch(
      `https://discover.search.hereapi.com/v1/discover?at=-23.289586,-45.962061&limit=3&q=${data.search}&apiKey=f5sd25QuVJBGiSIYNp3JFaBN42vK4eC8EAZqQq6iE6U`
    )
      .then((response) => response.json())
      .then((response) => {
        console.log(response);
        if (response.items) {
          setLocation({
            lat: response.items[0].position.lat,
            lng: response.items[0].position.lng,
          });
        }
      });
  }

  return (
    <View style={styles.container}>
      <Text>Open up App.js to start working on your app!</Text>
      <StatusBar backgroundColor="#9965ee" />
      <View style={styles.inputContainer}>
        <Controller
          control={control}
          render={({ field: { onChange, value } }) => (
            <TextInput
              placeholder="Lugar"
              onChangeText={onChange}
              keyboardType="default"
              autoCapitalize="none"
              value={value}
              style={styles.input}
            />
          )}
          name="search"
        />
        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit(handleSearch)}
        >
          <Text>Buscar</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.mapContainer}>
        <MapView style={styles.map}>
          <Mapbox.Camera
            zoomLevel={15}
            centerCoordinate={[location.lng, location.lat]}
          />
          <Mapbox.PointAnnotation
            id="irineu"
            coordinate={[location.lng, location.lat]}
          >
            <View style={styles.annotationContainer}>
              <View style={styles.annotationFill} />
            </View>
            <Mapbox.Callout title="Rocketseat House" />
          </Mapbox.PointAnnotation>
        </MapView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  mapContainer: {
    width: "100%",
    height: "80%",
    backgroundColor: "#000000",
  },
  map: {
    flex: 1,
  },
  statusbar: {
    backgroundColor: "#cc64c3",
  },
  inputContainer: {
    height: "20%",
    width: "60%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    gap: 10,
    padding: 10,
  },
  input: {
    height: 50,
    width: "70%",
    borderWidth: 1,
    borderColor: "black",
    padding: 10,
  },
  button: {
    borderWidth: 1,
    borderRadius: 15,
    padding: 6,
    backgroundColor: "#f2f2f2",
  },

  annotationContainer: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    borderRadius: 15,
  },
  annotationFill: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#7159C1",
    transform: [{ scale: 0.8 }],
  },
});
