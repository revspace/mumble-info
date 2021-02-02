"use strict";

const MumblePing = require('mumble-ping');
const mqtt = require("mqtt");

const mqttClient = mqtt.connect("mqtt://mosquitto.space.revspace.nl");

let users;
let lastPing = new Date().getTime();

function doMumblePing() {
	MumblePing('revspace.nl', function(_, res) {
		if (res.users != users) {
			users = res.users;
			console.log("Publishing", users);
			mqttClient.publish("revspace/m", users.toString(), {retain: true});
		}
		lastPing = new Date().getTime();
		setTimeout(() => {
			doMumblePing();
		}, 2000);
	});
}

doMumblePing();

function checkLastPing() {
	if (new Date().getTime() - lastPing > 30 * 1000) {
		console.log("Exiting Due To Ping Timeout");
		process.exit();
	}
	setTimeout(() => {
		checkLastPing();
	}, 1000);
}

checkLastPing();


