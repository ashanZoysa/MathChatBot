import React, { Component } from 'react';
import {  View, StyleSheet, TouchableOpacity , TextInput , Text, Image , ScrollView , Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-gesture-handler';
import * as ImagePicker from 'expo-image-picker';
import AwesomeAlert from 'react-native-awesome-alerts';
import moment, { relativeTimeRounding } from "moment";
import LocalIP from "./LocalIP"
import { ref , getDatabase , set , get , push } from 'firebase/database';
import axios from "axios";
import { MaterialCommunityIcons } from '@expo/vector-icons'
import uuid from 'react-native-uuid'
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';

export default class Chat extends React.Component {
  
  static navigationOptions = ({navigation}) => ({
    title: 'ChatBot',
    headerStyle: {
      backgroundColor: '#6e9cff',
      elevation: 0,
    },
    headerTintColor: '#000000',
    headerTitleStyle: {
      fontWeight: 'bold',
      fontSize: 24,
    },

    headerLeft: () => (
      <View style={{marginLeft: 10, marginTop:5}}>
        <TouchableOpacity  onPress={ () =>  navigation.navigate('HomePage') }>
          <MaterialCommunityIcons name="menu" color='#000000' size={30} />
        </TouchableOpacity>
      </View>
    ),
  });

  constructor(props) {
    super(props);
    
    this.state = {
      cid:'chatbot',
      recording: null,
      audioPermission: null,
      msg:'',
      msgArray: [],
      localUri:'',
      message:'',
      showAlert: false,
      title:'',
      userId: uuid.v4()
    };

    this.loadData();
    this.interval = setInterval(() => {this.componentDidMount()}, 500);

  }

  componentDidMount = async() => {
    const { status } = await Audio.requestPermissionsAsync();
    this.setState({ audioPermission: status === 'granted' });

    const userId = await this.state.userId

    get(ref(getDatabase(),'/messages/'+userId)).then( async(snapshot) => {
      var tmp_array = []
      snapshot.forEach((childSnapshot) => {
        if(this.state.cid==childSnapshot.val().cid){
          tmp_array.push({
            image:childSnapshot.val().image,
            message:childSnapshot.val().message,
            time:childSnapshot.val().time,
            user:childSnapshot.val().user
          })
        }
      })
      this.setState({msgArray:tmp_array})
    })
    
  }

  speak = (text) => {
    Speech.speak(text);
  };

  
  startRecording = async () => {
    const { audioPermission } = this.state;

    if (audioPermission) {
      const recording = new Audio.Recording();
      try {
        await recording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
        await recording.startAsync();
        this.setState({ recording:recording , recStart:true });
      } catch (error) {
        console.error('Error starting recording:', error);
      }
    }
  };

  stopRecording = async () => {
    const { recording } = this.state;

    if (recording) {
      try {
        await recording.stopAndUnloadAsync();
        this.setState({ recStart:false });
        this.sendRecordingToServer();
      } catch (error) {
        console.error('Error stopping recording:', error);
      }
    }
  };

  sendRecordingToServer = async () => {
    if (this.state.recording != null) {
        this.setState({loader:true})
        const { recording } = this.state;

        if (recording) {
        const uri = recording.getURI();
        console.log(uri)
        const data = new FormData();
        await data.append('file', {
            uri,
            type: 'audio/x-wav',
            name: 'audio.mp3',
        });

        try {
            await axios.post("http://"+LocalIP+":3500/main/upload",data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }).then(async(res) => {
                console.log(res.data.filename)
                const url="http://"+LocalIP+":2222/voice"
                const data = JSON.stringify({ url : res.data.filename , voiceData:this.state.voiceData});
                await axios.post(url,data,{
                  headers: { "Content-Type": "application/json" }
                }).then( async(res) =>{
                    console.log(res.data.text)
                    this.setState({msg:res.data.text});
                    this.onSend()
                })
            }).catch(error => {
            console.log(error);
            })
        } catch (error) {
            console.error('Error sending recording to server:', error);
        }
        }
    } else {
    this.setState({ title: "Required!", message: "Voice Record!" });
    this.showAlert();
    }
  };

  onSend = async() =>{
    if(this.state.msg!=""){
      const currentDate = moment(new Date()).format('YYYY-MM-DD_hh:mm:ss')
      const userId = await this.state.userId

      push(ref(getDatabase(),'messages/'+userId),{
        cid:this.state.cid,
        message:this.state.msg,
        time:currentDate,
        user:"user"
      }).then(async() => {
        var msg = this.state.msg
        this.setState({msg:""})
        const url="http://"+LocalIP+":2222/math_chatbot"
        const data = JSON.stringify({ text : msg });
        await axios.post(url,data,{
          headers: { "Content-Type": "application/json" }
        }).then( async(res) =>{
            console.log(res.data.res_text);
            this.speak(res.data.res_text);
            push(ref(getDatabase(),'messages/'+userId),{
              cid:this.state.cid,
              message:res.data.res_text,
              time:currentDate,
              user:"bot"
            }).catch((error) => {
              this.setState({title:"Error!",message:error})
              this.showAlert()
            });
        })
      }).catch((error) => {
        this.setState({title:"Error!",message:error})
        this.showAlert()
      });
    }else{
      this.setState({title:"Required!",message:"Please Type Your Message!"})
      this.showAlert()
    }
  }

  loadData = async() =>{
    const isLoggedIn = await AsyncStorage.getItem('isLoggedIn')

    if(isLoggedIn!=='true'){
    }
  }
  
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
    const {showAlert,msgArray,msg} = this.state;
    return (
        <View style={styles.container}>
          <ScrollView style={styles.scrollView}
          ref={ref => {this.scrollView = ref}}
          onContentSizeChange={() => this.scrollView.scrollToEnd({animated: true})}>
            {
              msgArray.map((msgs) =>
              {
                if(msgs.user=="user"){
                  return  (
                    <View style={styles.userChatView}>
                      <View><Text style={styles.userChat}>{msgs.message}</Text></View>
                    </View>)
                }else if(msgs.user=="bot"){
                  return  (
                    <View style={styles.partnerChatView}>
                      <View><Text style={styles.partnerChat}>{msgs.message}</Text></View>
                    </View>)
                }
              }
            )}
            
          </ScrollView>

          <View style={{width: 98 + '%', flexDirection: 'row' , marginTop:10}}>
            <View style={{width: 60 + '%',alignItems: 'center'}}>
              <TextInput
                placeholder="Type Your Message"
                value={this.state.msg}
                onChangeText={msg => this.setState({msg})}
                multiline={true}
                maxLength={200}
                numberOfLines={5}
                style={styles.input}
              />
            </View>
            <View style={{width: 20 + '%',alignItems: 'center'}}>
            {!this.state.recStart ? (
                <TouchableOpacity style={[styles.listButton, styles.gButton]} onPress={this.startRecording}>
                    <Text style={{color: '#ffffff', fontWeight: 'bold'}}>🎙Speak</Text>
                </TouchableOpacity>
            ) : null}
            {this.state.recStart ? (
                <TouchableOpacity style={[styles.listButton, styles.rButton]} onPress={this.stopRecording}>
                    <Text style={{color: '#ffffff', fontWeight: 'bold'}}>⏹Stop</Text>
                </TouchableOpacity>
            ) : null}
            </View>
            <View style={{width: 20 + '%',alignItems: 'center'}}>
              <TouchableOpacity style={[styles.listButton, styles.editButton]} onPress={this.onSend}>
                <Text style={{color: '#ffffff', fontWeight: 'bold'}}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>

          <AwesomeAlert
              show={showAlert}
              title={this.state.title}
              message={this.state.message}
              closeOnTouchOutside={true}
              closeOnHardwareBackPress={false}
              showCancelButton={true}
              cancelText="Close"
              cancelButtonColor="#6e9cff"
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
    backgroundColor: '#ffffff',
  },
  listImage : {
    width: 60, 
    height: 60
  },
  input: {
    borderBottomWidth: 1,
    width: 90 + '%',
    height:45,
    marginBottom:20,
    flexDirection: 'row',
    alignItems:'center',
    marginLeft: 4, 
    borderBottomColor: '#c4c4c4',
    color: '#000000'
  },
  TextInputStyleClass:{
    borderBottomWidth: 1,
    width: 80 + '%',
    height:100,
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
  listButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom:10,
    width: 95 + '%', 
    marginTop:10,
    height: 40,
    borderRadius: 10
  },
  loginButton: {
    backgroundColor: "#ffd175",
  },
  editButton: {
    backgroundColor: "#000000",
  },
  deleteButton: {
    backgroundColor: "#ed3228",
  },
  registerButton: {
    backgroundColor: "#000000",
  },
  userChat:{
    backgroundColor: '#575757' ,
    color: '#ffffff' ,
    padding: 10 ,
    borderTopRightRadius:0 , 
    borderRadius: 10 ,
    fontSize: 14 
  },
  userChatImage:{
    borderColor: '#6e9cff' ,
    width:260,
    height:260,
    borderTopRightRadius:0 , 
    borderRadius: 10 ,
    fontSize: 14,
    borderWidth:5
  },
  partnerChatImage:{
    borderColor: '#000000' ,
    width:260,
    height:260,
    borderTopLeftRadius:0 , 
    borderRadius: 10 ,
    fontSize: 14,
    borderWidth:5
  },
  userChatView:{
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems:'flex-start',
    marginBottom:5 ,
    marginLeft:10,
    marginRight:10
  },
  partnerChat:{
    backgroundColor: '#6e9cff' ,
    color: '#000000' ,
    padding: 10 ,
    borderTopLeftRadius:0 , 
    borderRadius: 10 ,
    fontSize: 14 
  },
  partnerChatView:{
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems:'flex-start',
    marginBottom:5 ,
    marginLeft:10,
    marginRight:10
  },
  rButton: {
    backgroundColor: "#920c0c",
  },
  gButton: {
    backgroundColor: "#135f0d",
  }
});