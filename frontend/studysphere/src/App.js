import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import SignIn from './Components/Signin';
import Home from './Components/Home';
import Navbar from './Components/Navbar';
import ResourcesComponent from './Components/Resource';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path='/' element={<Home/>}/>
        {/* <Route path='/register' element={<SignIn />} /> */}
        <Route path='/register' element={<ResourcesComponent />} />
       
      </Routes>
    </Router>
  );
}

export default App;
