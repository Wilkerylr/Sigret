import "./form_registro_reportes.css"

function FormRegistroReportes() {
    return (
        <div className="registro-reporte-contenedor">
            <form >

                <div className="registro-reporte-campos">
                    <div className="campo-grupo">
                        <label htmlFor="cliente">
                            Cliente
                        </label>
                        <div className="campo-grupo">
                            <select id="cliente" required>
                                <option value="">Selecciona un cliente</option>
                                <option value="cliente1">Cliente 1</option>
                                <option value="cliente2">Cliente 2</option>
                                <option value="cliente3">Cliente 3</option>
                            </select>
                        </div>
                    </div>

                        <div className="campo-grupo">
                            <label htmlFor="Equipo">
                                Equipo
                            </label>
                            <input
                            type="text"
                            id="Equipo"
                            placeholder="Equipo que recibe el servicio"
                            />
                            <div className="campo-grupo"></div>      
                        </div>

                        <div className="campo-grupo">
                            <label htmlFor="Descripcion_falla">
                                Descripción de la falla
                            </label>
                            <textarea
                            id="Descripcion_falla"
                            placeholder="Descripción de la falla reportada por el cliente"
                            />
                        </div>

                        <div className="campo-grupo">
                            <label htmlFor="Trabajo_realizado">
                                Trabajo realizado
                            </label>
                            <textarea
                            id="Trabajo_realizado"
                            placeholder="Indica detalladamente el trabajo realizado durante el servicio"
                            />
                        </div>

                        <div className="campo-grupo">
                            <label htmlFor="Repuestos_empleados">
                                Repuestos empleados
                            </label>
                            <select id="Repuestos_empleados" >
                                <option value="">Selecciona los repuestos empleados</option>
                                <option value="repuesto1">Repuesto 1</option>
                                <option value="repuesto2">Repuesto 2</option>
                                <option value="repuesto3">Repuesto 3</option>
                            </select>
                            <button type="button" className="agregar-repuesto"> Add </button>
                            <button type="button" className="Nuevo-repuesto"> New </button>
                            <div className="campo-grupo">
                                <input type="text" placeholder="Cantidad" />
                            </div>
                            <div className="campo-grupo">
                                <table className="tabla-repuestos">
                                    <thead>
                                        <tr>
                                            <th>Repuesto</th>
                                            <th>Cantidad</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>Repuesto 1</td>
                                            <td>2</td>
                                        </tr>
                                        <tr>
                                            <td>Repuesto 2</td>
                                            <td>1</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            
                        </div>

                        <div className="campo-grupo">
                            <label htmlFor="Posible_causa">
                                Posible causa
                            </label>
                            <textarea
                            id="Posible_causa"
                            placeholder="Solo debe ser llenado en caso de tener pruebas suficientes para conocer la causa de la falla (muestras de agua, circuitos quemados por alto voltaje, etc"
                            />
                        </div>

                        <div className="campo-grupo">
                            <label htmlFor="Anotaciones">
                                Anotaciones
                            </label>
                            <textarea
                            id="Anotaciones"
                            placeholder="Al comienzo de la seccion debera anotar el voltaje de alimentacion del equipo al cual se presto el servicio, a continuacion se puede anotar cualquier observación adicional que consideres relevante para el reporte"
                            />
                        </div>

                        <div className="campo-grupo">
                            <label htmlFor= "Declaracion">
                                Declaración
                            </label>
                            <div className="declaracion-radio-grupo">

                                <label> Operativo </label>
                                <input
                                    type="radio"
                                    id="Declaracion"
                                    name="declaracion"
                                    value= "operativo"
                                />
                                <label> Inoperativo </label>
                                <input
                                    type="radio"
                                    id="Declaracion"
                                    name="declaracion"
                                    value= "inoperativo"
                                /> 
                                <label> No aplica </label>
                                <input
                                    type="radio"
                                    id="Declaracion"
                                    name="declaracion"
                                    value= "no aplica"
                                />
                                <label> Operativo, bajo observacion</label>
                                <input
                                    type="radio"
                                    id="Declaracion"
                                    name="declaracion"
                                    value="operativo bajo observacion"
                                />

                            </div>

                        </div>
                        
                        <div className="campo-grupo">
                            <label htmlFor="etiquetas">
                                Etiquetas
                            </label>
                            <select id="etiquetas" required>
                                <option value="">Seleccione las etiquetas correspondientes</option>
                                <option value="etiqueta1">Etiqueta 1</option>
                                <option value="etiqueta2">Etiqueta 2</option>
                                <option value="etiqueta3">Etiqueta 3</option>
                            </select>

                            <button type="button" className="agregar-etiqueta"> Add </button>
                            <button type="button" className="Nueva-etiqueta"> New </button>
                            <div className="campo-grupo">
                                <table className="tabla-etiquetas">
                                    <thead>
                                        <tr>
                                            <th>Etiqueta</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>tag 1</td>
                                        </tr>
                                        <tr>
                                            <td>tag 2</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        
                        </div>

                         <div className="campo-grupo">
                            <label htmlFor="tecnicos">
                                Tecnicos
                            </label>
                            <select id="tecnicos" required>
                                <option value="">Seleccione los tecnicos correspondientes</option>
                                <option value="tecnico1">Tecnico 1</option>
                                <option value="tecnico2">Tecnico 2</option>
                                <option value="tecnico3">Tecnico 3</option>
                            </select>
                            
                            <button type="button" className="agregar-tecnicp"> Add </button>
                            <div className="campo-grupo">
                                <table className="tabla-etiquetas">
                                    <thead>
                                        <tr>
                                            <th>tecnico</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>tecnico 1</td>
                                        </tr>
                                        <tr>
                                            <td>tecnico 2</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        
                        </div>

                </div>

                <div className="registro-reporte-control">
                    <div className="numero-reporte">
                        <label htmlFor="numero-reporte">
                            Numero del reporte
                        </label>
                        <input 
                        type = "number"
                        id= "numero-reporte"
                        placeholder="XXXXXX"
                        ></input>
                        <label htmlFor="plantilla">Plantilla</label>
                        <select id="plantilla" required>
                            <option value="">Selecciona una plantilla</option>
                            <option value="plantilla1">Plantilla 1</option>
                            <option value="plantilla2">Plantilla 2</option>
                            <option value="plantilla3">Plantilla 3</option>
                        </select>
                        <label htmlFor="fecha-reporte">Fecha reporte</label>
                        <input 
                            type="date"
                            id="fecha-reporte"
                            required
                        > 
                        </input>

                        <label htmlFor="fecha-atencion">Fecha atencion</label>
                        <input 
                        type="date"
                        id="fecha-atencion"
                        required
                        ></input>

                        <label htmlFor="hora-inicio">Hora de inicio</label>
                        <input 
                        type="time"
                        id="hora-inicio"
                        required
                        ></input>
                        
                        <label htmlFor="hora-finalizacion">Hora de finalizacion</label>
                        <input 
                        type="time"
                        id="hora-finalizacion"
                        required
                        ></input>                        


                    </div>

                </div>

            </form>
        </div>
    ); 
}

export default FormRegistroReportes;