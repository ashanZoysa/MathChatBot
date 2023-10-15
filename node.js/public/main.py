import json , time
from flask import Flask, jsonify, request, make_response
from flask_cors import CORS
import requests
import shutil
import numpy as np
import os
import pickle
from tensorflow.keras.utils import custom_object_scope
import math
import random
import librosa, librosa.display
from tqdm import tqdm
from pydub import AudioSegment
import speech_recognition as sr

recognizer = sr.Recognizer()

with open('chatbot_model.dat' , 'rb') as f:
    math_chatbot_model = pickle.load(f)

app = Flask(__name__)

@app.after_request
def after_request(response):
  response.headers.add('Access-Control-Allow-Origin', '*')
  response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
  response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
  return response
@app.route('/math_chatbot', methods=['POST'])
def math_chatbot():
    
    try:
        request_data = request.get_json()

        text = str(request_data['text'])
        print(text)
        print(request_data)

        res_text = math_chatbot_model.predict([text])

        json_dump = json.dumps({"res_text":str(res_text[0]),"success":"true"})

        return json_dump
        
    except:
        json_dump = json.dumps({"success":"false"})

        return json_dump
    

@app.route('/voice', methods=['POST'])
def voice():
    
        request_data = request.get_json()

        audio_url = str("upload/"+(request_data['url'].split(".")[0]))

        print(audio_url)

        commandwav = "ffmpeg -i "+audio_url+".mp3 "+audio_url+".wav"
        os.system(commandwav)

        print(audio_url+".wav")

        with sr.AudioFile(audio_url+".wav") as source:
            audio = recognizer.record(source)

        text = recognizer.recognize_google(audio)

        print(text)

        json_dump = json.dumps({"text":text,"success":"true"})

        return json_dump


if __name__ == '__main__':
	app.run(host="0.0.0.0", port=2222)