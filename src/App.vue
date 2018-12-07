/* eslint-disable */
<template>
    <div id="app">
        <div class="picture-input">
            <picture-input
                ref="pictureInput"
                @change="onChanged"
                @remove="onRemoved"
                :width="500"
                :removable="true"
                removeButtonClass="ui red button"
                :height="500"
                accept="image/jpeg, image/png, image/"
                buttonClass="ui button primary"
                :customStrings="{
                    upload: '<h1>Upload it!</h1>',
                    drag: 'Drag and drop your image here'}"
            ></picture-input>
        </div>

        <div class="GMap">
            <GmapMap :center="center" :zoom.sync="properZoomIn" map-type-id="terrain" style="width: 524px; height: 524px">
                    <!-- v-for="(m, index) in markers" -->
                    <!-- key="1" -->
                <GmapMarker
                    v-if="marker != 0"
                    :position="marker.position"
                    :clickable="true"
                    :draggable="true"
                    @click="center=marker.position"
                />
            </GmapMap>
        </div>
        <div id=buttons>
            <button @click="attemptUpload" v-bind:class="{ disabled: !image }">Upload</button>
            <button @click="myLocation">Get location</button>
            <button @click="myLocationImg">Get location from image</button>
            <gmap-autocomplete @place_changed="setPlace"></gmap-autocomplete>
            <button @click="addMarker">Add</button>
        </div>
        <p>
            <img
                v-if="path != ''"
                :src="path"
                width="100%"
                height="500px"
            >
        </p>
    </div>
</template>

<script>
// eslint-disable-next-line
import pictureInput from "vue-picture-input";
import api from "./store/api";
import {gmapApi} from 'vue2-google-maps'
import Exif from 'exif-js'

export default {
    name: "app",
    computed: {
        google: gmapApi
    },
    data() {
        return {
        image: null,
        path: "",
        center: { lat: 0, lng: 0 },
        gpsFromImg: {lat: 0, lng: 0},
        marker: 0,
        markers: [],
        places: [],
        currentPlace: 0,
        properZoomIn: 15,
        };
    },
    components: {
        pictureInput
    },
    beforeMount() {
        this.geolocate();
    },
    methods: {
    onChanged() {
        console.log("New picture loaded");
        if (this.$refs.pictureInput.file) {
            this.image = this.$refs.pictureInput.file;
            var self = this;
            var lati = -1, longi = -1;
            Exif.getData(this.image, function() { 
                const latitude = Exif.getTag(this, "GPSLatitude");
                const longitude = Exif.getTag(this, "GPSLongitude");
                lati = latitude[0] + latitude[1] * 0.1 + latitude[2] * 0.001;
                longi = longitude[0] + longitude[1] * 0.1 + longitude[2] * 0.001;
                lati = Number(lati);
                longi = Number(longi)
                self.gpsFromImg.lat = lati;
                self.gpsFromImg.lng = longi;
                console.log(lati, longi);
                console.log(self.gpsFromImg);
            }); 
        } else {
            console.log("Old browser. No support for Filereader API");
        }
    },
    onRemoved() {
      this.image = null;
    },
    attemptUpload() {
        let formdata = new FormData();
        formdata.append("image", this.image);
        this.path = "" ;
        api.upload(formdata).then(response => {
            this.path = response.data;
            console.log(response);
        });
    },
    myLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(this.showPosition);
        } else {
            this.error = "Geolocation is not supported.";
        }
    },
    myLocationImg() {
        if (this.gpsFromImg) {
            console.log(this.gpsFromImg);
            this.center = this.gpsFromImg;
            this.marker = new google.maps.Marker({position: this.center});;
        } else {
            this.error = "Geolocation is not supported.";
        }
    },
    showPosition(position) {
        this.center.lat = parseFloat(position.coords.latitude);
        this.center.lng = parseFloat(position.coords.longitude);
        var mark = new google.maps.Marker({position: this.center});
        this.marker = mark;
        console.log(this.center.lat, this.center.lng);
    },
    setPlace(place) {
        this.currentPlace = place;
        console.log(typeof(this.currentPlace));
    },
    addMarker() {
        if (this.currentPlace) {
            const marker = {
                lat: parseFloat(this.currentPlace.geometry.location.lat()),
                lng: parseFloat(this.currentPlace.geometry.location.lng())
            };
            this.markers.push({ position: marker });
            this.marker = new google.maps.Marker({position: marker});
            this.places.push(this.currentPlace);
            this.center = marker;
            this.currentPlace = null;
        }
    },
    geolocate: function() {
      navigator.geolocation.getCurrentPosition(position => {
            this.center = {
                lat: parseFloat(position.coords.latitude),
                lng: parseFloat(position.coords.longitude)
            };
            var mark = new google.maps.Marker({position: this.center});
            this.marker = mark;
        });
    }
  }
};
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
.picture-input {
    width: 50%;
    float: left;
}
.GMap {
    width: 50%;
    float: left;
}

</style>
