import React, { useState } from 'react';
import Particles from 'react-particles-js';
import Navigation from './components/navigation/Navigation';
import Signin from './components/Signin/Signin';
import Register from './components/Register/Register';
import Logo from './components/logo/Logo';
import Rank from './components/rank/Rank';
import ImageLinkForm from './components/imageLinkForm/ImageLinkForm';
import FaceRecognition from './components/faceRecognition/FaceRecognition';
import './App.css';


const particlesOptions ={
  particles: {
    number: {
      value: 100,
      density:{
        enable: true,
        value_area: 800
      }
    }
  }
}

function App() {

  const [input, setInput] = useState('');
  const [box, setBox] = useState({
      top_row: 0,
      left_col: 0,
      bottom_row: 0,
      right_col: 0
  });
  const [route, setRoute] = useState('signin');
  const [isSignedIn, setSignedIn] = useState(false);
  const [user, setUser] = useState({
    id: '',
    name: '',
    email: '',
    entries: 0,
    joined: ''
  });

  const loadUser = (data) => {
    setUser((prev)=>({
      ...prev,
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined
    }));
  }

  const onInputChange = (event) =>{
    setInput(event.target.value);
  }

  const onSubmit = () => {
    fetch('https://pacific-sands-09625.herokuapp.com/imageurl', {
      method: 'post',
      headers: {'Content-type': 'application/json'},
      body: JSON.stringify({input})
    })
    .then(response => response.json())
    .then(res => {
      if(res){
        fetch('https://pacific-sands-09625.herokuapp.com/image', {
          method: 'put',
          headers: {'Content-type': 'application/json'},
          body: JSON.stringify({id: user.id})
        })
        .then(response => response.json())
        .then(count => {
          setUser(prev=>({
            ...prev,
            id: prev.id,
            name: prev.name,
            email: prev.email,
            entries: count,
            joined: prev.joined
          }))
        })
      }
      displayFace(calculateFaceLocation(res))
    })
    .catch(err => console.log(err));
  }

  const calculateFaceLocation = (data) => {
    const {
      top_row: top,
      left_col: left,
      bottom_row: bottom,
      right_col: right
    } = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputImage');
    const width = Number(image.width);
    const height = Number(image.height);

    return {
      top: top * height,
      left: left * width,
      bottom: height - (bottom* height),
      right: width - (right * width)
    }
  }

  const displayFace = (newBox) =>{
    setBox(newBox);
  }

  const onRouteChange = (newRoute) =>{
    if(newRoute === 'home'){
      setSignedIn(true)
    }else{
      setSignedIn(false);
      setBox(prev =>({
        top_row: 0,
        left_col: 0,
        bottom_row: 0,
        right_col: 0
      }));
      setInput('');
    }
    setRoute(newRoute);  
  }
  


  return (
    <div className="App">
    <Particles className='particles' params={particlesOptions} />
      <Navigation isSignedIn={isSignedIn} onRouteChange={onRouteChange} />
      {route === 'home'
        ? <>
          <Logo />
          <Rank name={user.name} entries={user.entries}/>
          <ImageLinkForm 
            onInputChange={onInputChange} 
            onSubmit={onSubmit} />
          <FaceRecognition 
            box={box} imageUrl={input}/>
            </>
          : (route === 'signin' 
              ? <Signin onRouteChange={onRouteChange} loadUser={loadUser}/>
                : <Register loadUser={loadUser} onRouteChange={onRouteChange}/>
              )
      }
    </div>
  );
}

export default App;
