/* eslint-disable */
<template>
    <div id="app">
        <div class="picture-input">
        <picture-input
            ref="pictureInput"
            @change="onChanged"
            @remove="onRemoved"
            :width="450"
            :removable="true"
            removeButtonClass="ui red button"
            :height="450"
            accept="image/jpeg, image/png, image/"
            buttonClass="ui button primary"
            :customStrings="{
                        upload: '<h1>Upload it!</h1>',
                        drag: 'Drag and drop your image here'}"
        ></picture-input>
    </div>

    <div class="GMap">
      <GmapMap
        :center="center"
        :zoom.sync="properZoomIn"
        map-type-id="terrain"
        style="width: 500px; height: 500px"
      >
        <GmapMarker
          v-if="marker != 0"
          :position="marker.position"
          :clickable="true"
          :draggable="true"
          @click="center=marker.position"
        />
      </GmapMap>
    </div>
    
    <div id="buttons" >
        <button @click="attemptUpload" v-bind:class="{ disabled: !image }">Upload</button>
        <button @click="newQuestion">Get new question</button>
        <button @click="myLocation">Get location</button>
        <button @click="myLocationImg">Get location from image</button>
        <gmap-autocomplete @place_changed="setPlace"></gmap-autocomplete>
        <button @click="addMarker">Add</button>
    </div>
    <h2>Qusetion:{{question}}</h2>
    <h2>Point:{{point}}</h2>
    <p>
      <img v-if="path != ''" :src="path" width="100%" height="500px">
    </p>
    </div>
</template>

<script>
// eslint-disable-next-line
import pictureInput from "vue-picture-input";
import api from "./store/api";
import { gmapApi } from "vue2-google-maps";
import Exif from "exif-js";

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
            gpsFromImglat: 0,
            gpsFromImglng: 0,
            marker: 0,
            markers: [],
            places: [],
            currentPlace: 0,
            properZoomIn: 15,
            question: "",
            point:0
        };
    },
    components: {
        pictureInput
    },
    mounted(){
        },
    beforeMount() {
        this.getQuestion();
        this.geolocate();
    },
    methods: {
        onChanged() {
            console.log("New picture loaded");
            if (this.$refs.pictureInput.file) {
                this.image = this.$refs.pictureInput.file;
                var self = this;
                var datas;
                var lati = -1,
                longi = -1;
                Exif.getData(this.image, function() {
                datas = Exif.getAllTags(this);
                const latitude = Exif.getTag(this, "GPSLatitude");
                const longitude = Exif.getTag(this, "GPSLongitude");
                lati = latitude[0] + latitude[1] / 60 + latitude[2] / 3600;
                longi = longitude[0] + longitude[1] / 60 + longitude[2] / 3600;
                self.gpsFromImglat = lati;
                self.gpsFromImglng = longi;
                console.log(
                    typeof self.gpsFromImglat,
                    typeof self.gpsFromImglng,
                    "100"
                );
                });
            } else {
                console.log("Old browser. No support for Filereader API");
            }
        },
        onRemoved() {
            this.image = null;
        },
        getQuestion() {
            api.getquestion().then(response => {
                this.question = response.data;
                console.log(response);
            })
        },
        attemptUpload() {
            let formdata = new FormData();
            formdata.append("image", this.image);
            formdata.set("question", this.question);
            this.path = "";
            api.upload(formdata).then(response => {
                this.path = response.data.url;
                this.point = response.data.point
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
            if (this.gpsFromImglat) {
                this.showPositionImg();
            } else {
                this.error = "Geolocation is not supported.";
            }
        },
        newQuestion() {
            this.getQuestion();
        },
        showPosition(position) {
            this.center.lat = parseFloat(position.coords.latitude);
            this.center.lng = parseFloat(position.coords.longitude);
            var mark = new google.maps.Marker({ position: this.center });
            this.marker = mark;
        },
        showPositionImg(position) {
            this.center.lat = parseFloat(this.gpsFromImglat);
            this.center.lng = parseFloat(this.gpsFromImglng);
            console.log(this.center);
            var mark = new google.maps.Marker({ position: this.center });
            this.marker = mark;
        },
        setPlace(place) {
            this.currentPlace = place;
            console.log(typeof this.currentPlace);
        },
        addMarker() {
            if (this.currentPlace) {
                const marker = {
                lat: parseFloat(this.currentPlace.geometry.location.lat()),
                lng: parseFloat(this.currentPlace.geometry.location.lng())
                };
                this.markers.push({ position: marker });
                this.marker = new google.maps.Marker({ position: marker });
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
            var mark = new google.maps.Marker({ position: this.center });
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
/* .buttons {
    top: 200px;
    width: 50%;
    float: up;
} */
</style>
