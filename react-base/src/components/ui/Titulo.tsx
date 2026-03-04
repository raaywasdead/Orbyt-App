interface TituloProps {
    texto: string;
}

function Titulo(props: TituloProps) {
        return <h2>{props.texto}</h2>
}

export default Titulo