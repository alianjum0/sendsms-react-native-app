/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
var SmsAndroid = require('react-native-sms-android');

import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Button,
  Switch,
  TextInput,
  ListView
} from 'react-native';

export default class AwesomeProject extends Component {
  // var self = this;
  constructor(props) {
    super(props);
    this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      connected: false,
      dataSource: this.ds.cloneWithRows([]),
      notifications: []
    };
    this.start("a");
  }

  start = function(address){
    var ws = new WebSocket('ws://192.168.1.20:3000');

    ws.onopen = () => {
      // connection opened
      this.state.connected = true;
      this.setState(this.state);
      var res = {type: "connected", status: true};
      res = JSON.stringify(res);
      ws.send(res); // send a message
    };

    ws.onmessage = (e) => {
      // a message was received
      console.log(e.data);
      var msg = JSON.parse(e.data);
      console.log(msg.type);
      if(msg.type == "sendMessage"){
        var that = this;
        msg.num.forEach(function(number){
          console.log(number);
          SmsAndroid.sms(
            number, // phone number to send sms to
            msg.body, // sms body
            'sendDirect', // sendDirect or sendIndirect
            (err, message) => {
              if (err){
                console.log("error");
                that.state.notifications.push({number: number, status: "error"});
              } else {
                console.log(message); // callback message
                var res = {type: "sendResponse", status: true, number: number};
                res = JSON.stringify(res);
                ws.send(res);
                that.state.notifications.push({number: number, status: message});
              }
              that.state.dataSource = that.ds.cloneWithRows(that.state.notifications);
              that.setState(that.state);
            }
          );
        });
      }
    };

    ws.onerror = (e) => {
      // an error occurred
      // this.state.connected = false;
      console.log(e.message);
    };

    ws.onclose = (e) => {
      // connection closed
      this.state.connected = false;
      this.setState(this.state);
      var that = this;
      setTimeout(function(){that.start("a")}, 5000);
      console.log(e.code, e.reason);
    };
  }

  onChange = (state) => {
    this.setState(state);
  }

  buttonClicked() {
    // console.log("button clicked");
    console.log(this.state.text);
    // msg = {message: this.state.text}
    // this.socket.emit("message",msg)
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>
          Welcome to SMS APP!
        </Text>
        <Text style={styles.instructions}>
          Connected to Server
        </Text>
        <Switch
          value={this.state.connected} />
        <ListView
          dataSource={this.state.dataSource}
          renderRow={(rowData) => <Text>Number: {rowData.number} Status: {rowData.status}</Text>}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

AppRegistry.registerComponent('AwesomeProject', () => AwesomeProject);
