import { useEffect, useState } from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import icon from '../../assets/icon.svg';
import './App.css';
import { DialogFileData } from './types';
const Hello = () => {

  const [items , setItem] = useState<any>();
  const [filePath, setFilePath] = useState<string[]>();

  const loadItem = async () =>{
    // console.log(window);
    // console.log(window.electron);

    if(!window.electron) {
      console.log("null");
      return;
    }
    let result = await window.electron.electronAPI()
    if(result?.length > 0){
      setItem(result);
    }
    console.log(result);
  }
  const  openFileAA = async () => {
    const files: DialogFileData =await window.electron.openFile();
    console.log('user files', files);
    if (files.filePaths) {
      setFilePath(files.filePaths);
    }
}

  // useEffect(()=>{
  //   loadItem();
  //   console.count()
  // },[])

  return (
    <div>
      <button onClick={()=>{loadItem()}}>Get all user</button>
      <div style={{paddingTop:"10px"}}>
        <button type="button" id="btn" onClick={openFileAA} style={{marginRight:"10px"}}>Open a File</button>
          File path: <strong id="filePath">{filePath}</strong>
      </div>
      <div>User from Db</div>
      {/* {items.map((item: any)=>{
        console.log(item);

        return (
          <></>
        // <div>{item?.id}</div>
          )
      })} */}
      {/* <div>{item?.id}</div> */}
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hello />} />
      </Routes>
    </Router>
  );
}
