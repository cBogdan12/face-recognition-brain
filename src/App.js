import React, { Component } from 'react';
import Navigation from './Components/Navigation/Navigation.js'
import Logo from './Components/Logo/Logo';
import ImageLinkForm from './Components/ImageLinkForm/ImageLinkForm'
//import Clarifai from 'clarifai';
// const Clarifai = require('clarifai');
import Rank from './Components/Rank/Rank';
import ParticlesBackground from "./Components/Particles/ParticlesBackground";
import FaceRecognition from './Components/FaceRecognition/FaceRecognition';
import SignIn from './Components/SignIn/SignIn.js';
import Register from './Components/Register/Register.js'
import './App.css';

//////////////////////////////////////
// const app = new Clarifai.App({
//  apiKey: '945d40c8e8734df2b536b40a18e20152'
// });
//////////////////////////////////////

// const input = document.getElementById('inputBox').value;
// console.log('input:', input)

////   https://docs.clarifai.com/api-guide/predict/images#via-url
const raw = JSON.stringify({
  "user_app_id": {
        "user_id": "hmk33u0fmwzw",
        "app_id": "faceRecognitionBrain"
    },
  "inputs": [
    {
      "data": {
        "image": {
          "url": "https://samples.clarifai.com/metro-north.jpg"
        }
      }
    }
  ]
});

const requestOptions = {
  method: 'POST',
  headers: {
    'Accept': 'application/json',
    'Authorization': 'Key 945d40c8e8734df2b536b40a18e20152'
  },
  body: raw
};

class App extends Component {
    constructor() {
        super();
        this.state= {
            input:'',
            imgURL:'',
            box: {},
            route: 'signin',
            //keeps track of where we are on the page
            isSignedIn: false,
        }
    }

    calculateFaceLocation = (data) => {
        const clarifaiFace = JSON.parse(data, null, 2).outputs[0].data.regions[0].region_info.bounding_box;
        console.log('clarifaiFace:', clarifaiFace)
        const image = document.getElementById('inputimage');
        const width = Number(image.width);
        const height = Number(image.height);
        console.log('image:', image, 'width:', width, 'height:', height)
        return {
            leftCol: clarifaiFace.left_col * width,
            topRow: clarifaiFace.top_row * height,
            rightCol: width - (clarifaiFace.right_col * width),
            bottomRow: height - (clarifaiFace.bottom_row * height) 
        }
    }

    boxMaker = (box) => {
        this.setState({box: box});
    }


    onInputChange = (event) => {
        this.setState({input: event.target.value});
    }

    onButtonSubmit = () => {
        this.setState({imgURL:this.state.input})

        //////  Uncaught ReferenceError: process is not defined  //////
        // app.models
        //     .predict(
        //         // '6dc7e46bc9124c5c8824be4822abe105',
        //        Clarifai.FACE_DETECTION_MODEL,
        //          this.state.input
        //        )
        //     .then(
        //         function(response) {
        //             console.log(response)
        //         },
        //         function(err) {
        //             //there was an error
        //         }
        // );
        ////////////////////////////////////////////////////////////////////////

        fetch("https://api.clarifai.com/v2/models/face-detection/outputs", 
            {
              method: 'POST',
              headers: {
                'Accept': 'application/json',
                'Authorization': 'Key 945d40c8e8734df2b536b40a18e20152'
              },
              body: JSON.stringify({
                  "user_app_id": {
                        "user_id": "hmk33u0fmwzw",
                        "app_id": "faceRecognitionBrain"
                    },
                  "inputs": [
                    {
                      "data": {
                        "image": {
                          "url": `${this.state.input}`
                        }
                      }
                    }
                  ]
                }
            )})
          .then(response => response.text())
          .then(result => this.boxMaker(this.calculateFaceLocation(result)))
          .catch(error => console.log('error', error));
     }

     onRouteChange = (route) => {
        if (route === 'signout' ) {
            this.setState({isSignedIn: false})
        } else if (route === 'home') {
            this.setState({isSignedIn: true})
        }
        this.setState({route: route});
     }


    render() {
        const { isSignedIn, imgURL, route, box } = this.state;
        return (
          <div className="App">
            <ParticlesBackground />
            <Navigation  
            onRouteChange={this.onRouteChange}
            isSignedIn={isSignedIn} 
            />
            { route === 'home' 
                ? <div> 
                    <Logo />
                    <Rank />
                    <ImageLinkForm 
                    onInputChange={this.onInputChange} 
                    onButtonSubmit={this.onButtonSubmit} 
                    />
                    <FaceRecognition box={box} imgURL={imgURL} />
                </div>
                : (
                    route === 'signin' 
                    ? <SignIn onRouteChange={this.onRouteChange} />
                    : <Register onRouteChange={this.onRouteChange} />
                    )
           }
          </div>
        ) 
    }
}  
export default App;
