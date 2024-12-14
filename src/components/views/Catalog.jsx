import { userOut } from "../firebase/firebase-auth";
import Button from "@mui/material/Button";

function Catalog(){

    const logout = () =>{
        userOut();
    }; 
    return(
        <div>
        <Button onClick={() => logout()}>Salir</Button>
        <h1>Yo habia puesto las películas aquí</h1>
        </div>
    )
}

export default Catalog;