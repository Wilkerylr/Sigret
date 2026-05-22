import React, { useState } from "react";
import "../Global.css";
//import "./Busqueda_reportes.css";

const BusquedaReportes: React.FC = () => {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<string[]>([]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (query.trim()) {
            setResults([`Resultado para: "${query}"`]);
        } else {
            alert("Por favor ingrese un término de búsqueda");
        }
    };

    return (
        <div className="busqueda-reportes">
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Ingrese su búsqueda..."
                    value={query}
                    onChange={handleSearch}
                />
                <button type="submit">Buscar</button>
            </form>
            <ul>
                {results.map((result, index) => (
                    <li key={index}>{result}</li>
                ))}
            </ul>
        </div>
    );
};

export default BusquedaReportes;