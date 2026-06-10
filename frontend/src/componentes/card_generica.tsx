import "./card_generica.css";

interface CardGenericaProps {
    title: string;
}

function CardGenerica({ title }: CardGenericaProps) {

    return (
        <div className="card">
            <h2>{title}</h2>
        </div>
    );
}

export default CardGenerica;