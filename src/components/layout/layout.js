// import GetJsonList from '../share/getJsonList';
import React from "react";
import { useState, useEffect, useRef } from "react";
import { storage, database } from "../share/firebase";
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

import {ref as ref2, set, onValue, get} from "firebase/database";

function Layout() {

    const [name, setName] = useState('ale');
    const [lastname, setLastname] = useState('menciones');
    const [ci, setCi] = useState(123456);
    const [cel, setCel] = useState(123456);
    const [family, setFamily] = useState('test');
    const [position, setPosition] = useState('test');
    const [club, setClub] = useState('test');
    const [resumen, setResumen] = useState('test');
    const [height, setHeight] = useState('test');
    const [wheight, setWheight] = useState('test');

    const fileUpload = useRef(null);
    const [image, setImage] = useState(null);
    const [upload_image, setUploadImage] = useState(null);
    const [upload_image_name, setUploadImageName] = useState(null);
    const [data, setData] = useState({});
    const [query, setQuery] = useState(null);
    const [update, setUpdate] = useState(null);
    const [add, setAdd] = useState(0);
    const [updateImage, setUpdateImage] = useState(0);
    const [deleteState, setDelete] = useState(null);
    const [message, setMessage] = useState(null);
    const [message_show, setMessageShow] = useState(0);
    const no_upload_image_path = "../../assets/images/no-user-image.png";
    const no_upload_image = require("../../assets/images/no-user-image.png");

    const handleUpload = () => {
        fileUpload.current.click();
    };
    const validation_digit = (ci) => {
        var a = 0;
        var i = 0;
        if(ci.length <= 6){
          for(i = ci.length; i < 7; i++){
            ci = '0' + ci;
          }
        }
        for(i = 0; i < 7; i++){
          a += (parseInt("2987634"[i]) * parseInt(ci[i])) % 10;
        }
        if(a%10 === 0){
          return 0;
        }else{
          return 10 - a % 10;
        }
    }
    const validate_ci = (ci) => {
        ci = clean_ci(ci);
        var dig = ci[ci.length - 1];
        ci = ci.replace(/[0-9]$/, '');
        return (dig == validation_digit(ci));
    }
    const random_ci = () => {
        var ci = Math.floor(Math.random() * 10000000).toString();
        ci = ci.substring(0,7) + validation_digit(ci);
        return ci;
    }
    const clean_ci = (ci) => {
        return ci.replace(/\D/g, '');
    }
    const updateFicha = (ci) => {

        setUploadImage(null);
        setAdd(0);
        setUpdate(ci);

        const ficha = data[ci];

        setName(ficha.name);
        setLastname(ficha.lastname);
        setCi(ficha.ci);
        setCel(ficha.cel);
        setFamily(ficha.family);
        setPosition(ficha.position);
        setClub(ficha.club);
        setResumen(ficha.resumen);
        setHeight(ficha.height);
        setWheight(ficha.wheight);
        setImage(ficha.image);
    }
    const deleteFicha = (id) => {
        const ficha = ref2(database, 'fichas/' + id);
        if (data[id].image == image) resetFile();
        set(ficha, null);
        setUpdate(null);
        setDelete(null);
        setMessage(ci + ' was deleted');
    };
    const saveFicha = () => {

        if (!update && !!data[ci]) {
            setMessage('la ficha con ci ' + ci + ' ya ha sido agregada anteriormente');
            return;
        }
        // if (image == null) {
        //     setImage(no_upload_image_path);
        //     // setMessage('Debes seleccionar una imagen para continuar');
        //     // return;
        // };

        const ficha = ref2(database, 'fichas/' + ci);
        const ficha2 = update && update != ci ? ref2(database, 'fichas/'+update) : null
        const imageRef = !update ? ref(storage, 'images/' + ci) : (update && updateImage ? ref(storage, 'images/' + ci) : null);

        if(image && imageRef){
            uploadBytes(imageRef, image)
            .then((snapshot) => {
                getDownloadURL(snapshot.ref)
                .then((url) => {
                    set(ficha, {
                        image: url,
                        name: name,
                        lastname: lastname,
                        ci: ci,
                        cel: cel,
                        family: family,
                        position: position,
                        club: club,
                        resumen: resumen,
                        height: height,
                        wheight: wheight
                    });
                    if (ficha2) set(ficha2, null);
                    if (update){
                        setUpdate(null);
                        setMessage("Updated succefully");
                    }else{
                        setAdd(0);
                        setMessage("Added succefully");
                    }
                    setUpdateImage(0);
                    setImage(null);
                    setUpdateImage(0);
                    setUploadImage(null);
                })
                .catch((error) => {
                    setMessage(error.message);
                })
            })
            .catch((error) => {
                console.log(error.message);
                setMessage(error.message);

            });
        } else {
            set(ficha, {
                name: name,
                lastname: lastname,
                image: image,
                ci: ci,
                cel: cel,
                family: family,
                position: position,
                club: club,
                resumen: resumen,
                height: height,
                wheight: wheight
            });
            if (ficha2){
                set(ficha2, null);
                console.log("deleted");
            }
            if (update){
                setUpdate(null);
            }else{
                setAdd(0);
            }
            setUpdateImage(0);
            setImage(null);
            setUploadImage(null);
            setMessage("updated succefully");
        }
    };
    const resetFile = () => {
        setUploadImage(null);
        setName(null);
        setLastname(null);
        // setCi(null);
        setCel(null);
        setFamily(null);
        setPosition(null);
        setClub(null);
        setResumen(null);
        setHeight(null);
        setWheight(null);
        setImage(null);

        // TEST RANDOM CI
        let ci = random_ci();
        setCi(ci);
    };
    useEffect(() => {

        // resetFile();

        // TEST RANDOM CI
        let ci = random_ci();
        setCi(ci);

        const fireDb = ref2(database, 'fichas');

        // reset DATABASE
        // if (fireDb) set(fireDb, null);

        onValue(fireDb, (snapshot) => {
            if (snapshot.val() !== null) {
                setData({ ...snapshot.val() });
            } else {
                setData({});
            }
        });
        return () => {
            setData({});
        };
    }, []);
    useEffect(() => {
        if (!deleteState) return;
        const ficha = ref2(database, 'fichas/' + ci);
        if (ficha){
            set(ficha, null);
            setUpdate(null);
            setDelete(null);
            setMessage(ci + ' was deleted');
        }
    }, [deleteState]);
    useEffect(() => {
        if (!message) return;
        setMessageShow(1);
        setTimeout(() => {
            setMessageShow(0);
            setTimeout(() => {
                setMessage(0);
            }, 1000);
        }, 4000);
    }, [message]);

    return (
        <main>

            <div className="main-wrapper">

                {/* MENSAJE */}
                <p className={`message ${message_show ? "show" : ""}`}>{message}</p>

                {/* FICHA */}
                {update || add ?
                    <div className='ficha'>
                        <div className='divider'>

                            <div className='divide image_wrapper'>
                                {image ? (
                                    upload_image ? <img className='image_' src={upload_image} /> : <img className='image_' src={image} />
                                ) : <img className='image_not' src={no_upload_image} />}
                            </div>

                            <div className='divide data_list'>
                            <button className='close_btn'
                                onClick={(event) => {
                                resetFile();
                                if (add)
                                    setAdd(0);
                                else
                                    setUpdate(0);
                                }}>
                                {/* {update ? 'calcel update' : 'cancel add'} */}
                                X
                            </button>
                            <div className='data_list_wrapper'>

                                <label> Nombre:
                                </label>
                                <input
                                    type='text'
                                    value={name}
                                    placeholder="name"
                                    onChange={(event) => {
                                        setName(event.target.value);
                                    }}
                                />
                                <label>Apellido:
                                </label>
                                <input type='text'
                                value={lastname}
                                placeholder="lastname"
                                onChange={(event) => {
                                    setLastname(event.target.value)
                                }}/>
                                <label>Cedula:
                                </label>
                                <input type='text'
                                value={ci}
                                placeholder="ci"
                                onChange={(event) => {
                                    setCi(event.target.value)
                                }}/>
                                <label>Teléfono:
                                </label>
                                <input type='text'
                                value={cel}
                                placeholder="cel"
                                onChange={(event) => {
                                    setCel(event.target.value)
                                }}/>
                                <label>Familia
                                </label>
                                <input type='text'
                                value={family}
                                placeholder="family"
                                onChange={(event) => {
                                    setFamily(event.target.value)
                                }}/>
                                <label>Posición:
                                </label>
                                <input type='text'
                                value={position}
                                placeholder="position"
                                onChange={(event) => {
                                    setPosition(event.target.value)
                                }}/>
                                <label>Club:
                                </label>
                                <input type='text'
                                value={club}
                                placeholder="club"
                                onChange={(event) => {
                                    setClub(event.target.value)
                                }}/>
                                <label>Resumen:
                                </label>
                                <textarea
                                value={resumen}
                                placeholder="resumen"
                                onChange={(event) => {
                                    setResumen(event.target.value)
                                }}/>
                                <label>Altura:
                                </label>
                                <input type='text'
                                value={height}
                                placeholder="height"
                                onChange={(event) => {
                                    setHeight(event.target.value)
                                }}/>
                                <label>Peso:
                                </label>
                                <input type='text'
                                value={wheight}
                                placeholder="wheight"
                                onChange={(event) => {
                                    setWheight(event.target.value)
                                }} />
                                <p className='upload_image_name'>
                                    {upload_image_name}
                                </p>
                                <input
                                type="file"
                                id="file"
                                ref={fileUpload}
                                onChange={(event) => {
                                    if (event.target.files[0]) {
                                        setUpdateImage(true);
                                        setImage(event.target.files[0]);
                                        setUploadImageName(event.target.files[0].name);
                                        setUploadImage(URL.createObjectURL(event.target.files[0]));
                                    }
                                }} />

                                <div className="tools">
                                        <button className='button upload_image_btn' onClick={() => handleUpload()}>Imagen</button>
                                    {update ?
                                        <button className="button" onClick={(event)=>{setDelete(true)}}>Eliminar</button>
                                    : null}

                                    <button className="button" onClick={saveFicha}>Guardar</button>
                                </div>
                            </div>
                            </div>
                        </div>
                    </div>
                : null}
                
                {!update && !add ?
                <header>
                    {/* SEARCH */}
                    <input type='text'
                        placeholder="Buscar..."
                        onChange={(event) => {
                            setQuery(event.target.value);
                        }} />
                    {/* ADD */}
                    {!add && !update ?
                        <button onClick={(event) => { setAdd(1); }}>+</button>
                    : null}
                </header>
                : null}

                {/* LIST OF ALL */}
                {!update && !add ?
                    <div className='list-wrapper'>
                        {Object.keys(data).map((id, index) => {
                            if (!query || (query &&
                                data[id].name.toLowerCase().includes(query)
                                || data[id].lastname.toLowerCase().includes(query)
                                || data[id].ci.toString().includes(query)
                            )) {
                                return (
                                    <div className='list' key={id}>
                                        <p className="caption">{`${data[id].name} ${data[id].lastname}`}</p>
                                        <div className='inner image_wrapper'>
                                            <img onClick={(event) => { updateFicha(data[id].ci) }} className='image_' src={data[id].image || no_upload_image} />
                                        </div>
                                        {/* <button onClick={(event)=>{ deleteFicha(data[id].ci) }}> ELIMINAR</button> */}
                                    </div>
                                );
                            } else {
                                return null;
                            }
                        })}
                    </div>
                : null}
            </div>
        </main>
    )
};
export default Layout;