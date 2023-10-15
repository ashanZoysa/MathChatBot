import React, { Component } from 'react';
import {  View, StyleSheet, TouchableOpacity, Text, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-gesture-handler';
import AwesomeAlert from 'react-native-awesome-alerts';

export default class HomePage extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      message:'',
      showAlert: false,
      title:''
    };

  }

  logout = async() => {
    AsyncStorage.clear();
    this.props.navigation.replace('Login')
  }

  static navigationOptions = ({navigation}) => ({
    title: 'Home Page',
    headerStyle: {
      backgroundColor: '#6e9cff',
      elevation: 0,
    },
    headerTintColor: '#ffffff',
    headerTitleStyle: {
      fontWeight: 'bold',
      fontSize: 24,
    }
  });

  showAlert = () => {
    this.setState({
      showAlert: true
    });
  };
 
  hideAlert = () => {
    this.setState({
      showAlert: false,
      message: '',
      title: ''
    });
  };

  render() {
    const {showAlert} = this.state;
    return (
      <View style={styles.container}>
        <Image source={require('./../assets/logo.png')}
          style={{width: 200, height: 200 ,marginBottom:50 }} />

        <TouchableOpacity style={[styles.buttonContainer, styles.loginButton]} onPress={() =>  this.props.navigation.navigate('Chat')}>
          <Text style={{color: '#ffffff', fontWeight: 'bold'}}>Q & A ChatBot</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.buttonContainer, styles.loginButton]} onPress={() =>  this.props.navigation.navigate('Chat')}>
          <Text style={{color: '#ffffff', fontWeight: 'bold'}}>Maths ChatBot</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.buttonContainer, styles.registerButton]} onPress={this.logout}>
          <Text style={{color: '#ffffff', fontWeight: 'bold'}}>Logout</Text>
        </TouchableOpacity>

        <AwesomeAlert
            show={showAlert}
            title={this.state.title}
            message={this.state.message}
            closeOnTouchOutside={true}
            closeOnHardwareBackPress={false}
            showCancelButton={true}
            cancelText="Close"
            cancelButtonColor="#AEDEF4"
            onCancelPressed={() => {
              this.hideAlert();
            }}
          />

      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  input: {
    borderBottomWidth: 1,
    width: 80 + '%',
    height:45,
    marginBottom:20,
    flexDirection: 'row',
    alignItems:'center',
    marginLeft: 4, 
    borderBottomColor: '#c4c4c4',
    color: '#000000'
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom:10,
    width: 80 + '%',
    height: 40,
    borderRadius: 60
  },
  loginButton: {
    backgroundColor: "#6e9cff",
  },
  registerButton: {
    backgroundColor: "#575757",
  }
});