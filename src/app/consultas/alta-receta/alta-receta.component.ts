/******************************************************************|
|NOMBRE: AltaRecetaComponent.                                      | 
|------------------------------------------------------------------|
|DESCRIPCIÓN: Componente que inserta una receta a la consulta.     |
|------------------------------------------------------------------|
|AUTOR: Ricardo Luna.                                              |
|------------------------------------------------------------------|
|FECHA: 17/09/2019.                                                |
|------------------------------------------------------------------|
|                       HISTORIAL DE CAMBIOS                       |
|------------------------------------------------------------------|
| #   |   FECHA  |     AUTOR      |           DESCRIPCIÓN          |
*/

import { UtilidadesService } from './../../utilidades.service';
import { FormBuilder } from '@angular/forms';
import { EsperarService } from './../../esperar.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { AbstractControl } from '@angular/forms';
import { FormulariosService } from './../../formularios.service';
import { Subject, fromEvent } from 'rxjs';
import { ConsultasService } from './../../consultas.service';
import { switchAll, debounceTime, map, find } from 'rxjs/operators';
import { AgregarMedicamentoComponent } from '../agregar-medicamento/agregar-medicamento.component';

@Component({
  selector: 'app-alta-receta',
  templateUrl: './alta-receta.component.html',
  styleUrls: ['./alta-receta.component.css']
})
export class AltaRecetaComponent implements OnInit {

  //Identificador de la consulta. Tomada de la url.
  consultaId: string;
  //Objeto que contendrá el formulario de alta de las recetas.
  formAltaRecetas: FormGroup;
  //Propiedad para cuando se oprime el botón de crear receta.
  pulsarCrear: boolean = false;
  //Indica que ya se verificó que la información de la consulta está lista.
  verificarInfoConsulta: boolean = false;
  //Indica si la carga inicial de la página ya terminó.
  cargaInicialLista$: Subject<Boolean> = new Subject<Boolean>();
  //Objeto del formulario que contendrá al campo referencias.
  referenciasControl: AbstractControl;
  //Variable que almacena el control de referencias del formulario.
  @ViewChild('referenciasHTML') referenciasHTML: ElementRef;
  //Cuadro de texto de búsqueda.
  @ViewChild('buscarInfoHTML') buscarInfoHTML: ElementRef;
  //Almacena los medicamentos y sus indicaciones (se utiliza para filtrar).
  medicamentos: Array<any> = [];
  //Almacena los medicamentos previamente añadidos a la receta.
  medicamentosOriginal: Array<any> = [];

  /*----------------------------------------------------------------------|
  |  NOMBRE: constructor.                                                 |
  |-----------------------------------------------------------------------|
  |  DESCRIPCIÓN: Método constructor del componente.                      | 
  |-----------------------------------------------------------------------|
  |  PARÁMETROS DE ENTRADA:                                               |
  |  rutaNavegacion   = para navegar a otras url's,                       |
  |  esperarService = contiene los métodos para mostrar o no la espera,   |
  |  fb = contiene los métodos para manipular formularios HTML,           |
  |  utilidadesService = Contiene métodos genéricos y útiles,             |  
  |  rutaActual = para obtener los parámetros de la url,                  |  
  |  consultasService = contiene los métodos de bd. de las consultas.     |                          
  |-----------------------------------------------------------------------|
  |  AUTOR: Ricardo Luna.                                                 |
  |-----------------------------------------------------------------------|
  |  FECHA: 09/11/2018.                                                   |    
  |----------------------------------------------------------------------*/
  constructor(private rutaNavegacion: Router,
    private esperarService: EsperarService,
    private fb: FormBuilder,
    private utilidadesService: UtilidadesService,
    private rutaActual: ActivatedRoute,    
    private consultasService: ConsultasService) {

    //Se agregan las validaciones al formulario.
    this.formAltaRecetas = fb.group({
      'referencias': ['', Validators.required]
    });

    //Se relacionan los elementos del formulario con las propiedades/variables creadas.
    this.referenciasControl = this.formAltaRecetas.controls['referencias'];

    //Obtiene el identificador de la consulta de la url.
    this.rutaActual.paramMap.subscribe(params => {
      this.consultaId = params.get("id");
    });

  }

  ngOnInit() {

    //Se obtiene el método de tecleado del elemento HTML de búsqueda.
    fromEvent(this.buscarInfoHTML.nativeElement, 'keyup')
      //Extrae el valor de la búsqueda.
      .pipe(map((e: any) => e.target.value))
      //Se realiza la búsqueda.
      .pipe(map((query: string) => this.utilidadesService.filtrarDatos(query, this.medicamentosOriginal)))
      //Se utiliza para obtener solo la búsqueda más reciente.
      .pipe(switchAll())
      //Se actualiza la información del arreglo.
      .subscribe((resultados: JSON[]) => {
        //Se actualiza la información en pantalla.        
        this.medicamentos = resultados;
      });

    //Evento de cuando se pega con el mouse algun texto en la caja de texto.
    fromEvent(this.buscarInfoHTML.nativeElement, 'paste')
      //Extrae el texto del cuadro de texto.
      .pipe(map((e: any) => e.target.value))
      .pipe(debounceTime(50))
      //Se subscribe al evento.
      .subscribe((cadena: string) => {
        //Genera un evento de teclazo para asegurar que se dispare el evento.
        this.buscarInfoHTML.nativeElement.dispatchEvent(new Event('keyup'));
      });
  }

  /*----------------------------------------------------------------------|
  |  NOMBRE: regresar.                                                    |
  |-----------------------------------------------------------------------|
  |  DESCRIPCIÓN: Regresa al menú de listado de recetas.                  |   
  |-----------------------------------------------------------------------|
  |  AUTOR: Ricardo Luna.                                                 |
  |-----------------------------------------------------------------------|
  |  FECHA: 17/09/2019.                                                   |    
  |----------------------------------------------------------------------*/
  regresar() {
    //Se regresa a la lista de diagnósticos.
    this.rutaNavegacion.navigateByUrl('consultas/lista-recetas/' + this.consultaId);
  }

  /*----------------------------------------------------------------------|
  |  NOMBRE: infoConsultaLista.                                           |
  |-----------------------------------------------------------------------|
  |  DESCRIPCIÓN: Método que obtiene la info de la consulta.              |   
  |-----------------------------------------------------------------------|
  |  PARÁMETROS DE ENTRADA: info = información de la consulta.            |  
  |-----------------------------------------------------------------------|
  |  AUTOR: Ricardo Luna.                                                 |
  |-----------------------------------------------------------------------|
  |  FECHA: 20/11/2018.                                                   |    
  |----------------------------------------------------------------------*/
  infoConsulta(info) {
    this.verificarInfoConsulta = true;
    this.cargaInicialLista$.next(this.verificarInfoConsulta);
  }

  /*----------------------------------------------------------------------|
  |  NOMBRE: limpiarCampoBusqueda.                                        |
  |-----------------------------------------------------------------------|
  |  DESCRIPCIÓN: Limpia el campo de búsqueda y restablece la info. orig. | 
  |-----------------------------------------------------------------------|
  |  AUTOR: Ricardo Luna.                                                 |
  |-----------------------------------------------------------------------|
  |  FECHA: 22/09/2019.                                                   |    
  |----------------------------------------------------------------------*/
  limpiarCampoBusqueda() {

    //Si el campo tiene algo escrito se limpiará.
    if (this.buscarInfoHTML.nativeElement.value.length > 0) {
      //limpia el cuadro de texto.
      this.buscarInfoHTML.nativeElement.value = "";
      //Actualiza la información con la original.
      this.medicamentos = this.medicamentosOriginal;
    }
    //Le da un focus al elemento de búsqueda.
    this.buscarInfoHTML.nativeElement.focus();
  }

  /*----------------------------------------------------------------------|
  |  NOMBRE: altaReceta.                                                  |
  |-----------------------------------------------------------------------|
  |  DESCRIPCIÓN: Método para dar de alta una receta.                     | 
  |-----------------------------------------------------------------------|
  |  AUTOR: Ricardo Luna.                                                 |
  |-----------------------------------------------------------------------|
  |  FECHA: 22/09/2019.                                                   |    
  |----------------------------------------------------------------------*/
  altaReceta() {

    //Se pulsa el botón  de dar de alta consulta.
    this.pulsarCrear = true;

    /*Si los elementos del formulario estáticos requeridos no están llenos, 
    se hace un focus para que se ingrese texto.*/
    if (this.referenciasControl.invalid) {
      this.referenciasHTML.nativeElement.focus();
      return;
    }

    //Si no se agregó ningún medicamento.
    if (this.medicamentosOriginal.length == 0) {
      this.utilidadesService.alerta("Sin medicamentos", "Agregue por lo menos un medicamento a la receta.").subscribe();
      return;
    }

    //Se abre el modal de espera.
    this.esperarService.esperar();

    this.consultasService.altaReceta(this.consultaId, this.referenciasControl.value).subscribe(respuesta => {
      //Si hubo un error en la obtención de información.
      if (respuesta["estado"] === "ERROR") {
        //Muestra una alerta con el porqué del error.
        this.utilidadesService.alerta("Error", respuesta["mensaje"]);
      }
      else {

        //Se obtiene el identificador de la receta recién creado.
        let recetaId: string = respuesta["mensaje"];   

        //Indica que el almacenamiento de los medicamentos ya terminó.
        let medicamentosAlmacenados$: Subject<string> = new Subject<string>();
        //Almacena los medicamentos que se han guardado.
        let medicamentosGuardados: Array<string> = new Array();

        //Se recorren los medicamentos agregados para grabarlos.
        this.medicamentosOriginal.forEach((medicamento, indice) => {
          //Se dan de alta los medicamentos de la receta.
          this.consultasService.altaDetReceta(
            recetaId, medicamento.id, medicamento.dosis,
            medicamento.frecuencia, medicamento.frecuencia_unidad_tiempo_id, medicamento.duracion,
            medicamento.duracion_unidad_tiempo_id, medicamento.indicaciones_uso).
            subscribe(respuestaDetReceta => {              
              medicamentosAlmacenados$.next(medicamento.id);              
          });
        });

        medicamentosAlmacenados$.subscribe(medicamentoId => {          
          medicamentosGuardados.push(medicamentoId);
          //Si ya se almacenaron todos los medicamentos en la base de datos, se detiene la espera.
          if(medicamentosGuardados.length == this.medicamentosOriginal.length){
            this.esperarService.noEsperar();
            medicamentosAlmacenados$.unsubscribe();
            //Se retorna a la lista de recetas.                         
            this.utilidadesService.alerta("Receta creada", "La receta fue creada satisfactoriamente.").subscribe(() => {
              this.regresar();
            });
          }
        });

      }
    });

  }

  /*----------------------------------------------------------------------|
  |  NOMBRE: eliminarMedicamento.                                         |
  |-----------------------------------------------------------------------|
  |  DESCRIPCIÓN: Método para eliminar un medicamento de la lista.        | 
  |-----------------------------------------------------------------------|
  |  PARÁMETROS DE ENTRADA:indiceArreglo = índice del elemento a eliminar,|
  |  confirmacion = si va a existir un mensaje de confirmación.           |
  |-----------------------------------------------------------------------|  
  |  AUTOR: Ricardo Luna.                                                 |
  |-----------------------------------------------------------------------|
  |  FECHA: 09/10/2019.                                                   |    
  |----------------------------------------------------------------------*/
  eliminarMedicamento(indiceArreglo, confirmacion: boolean = true) {

    if (confirmacion) {
      this.utilidadesService.confirmacion("Quitar medicamento", "¿Desea quitar el medicamento?").subscribe(respuesta => {
        if (respuesta == "Aceptar") {
          this.limpiarCampoBusqueda();

          //Se elimina el medicamento del arreglo.
          let indice = this.medicamentosOriginal.findIndex(elemento => elemento["indice_arreglo"] == indiceArreglo);
          this.medicamentosOriginal.splice(indice, 1);
          this.medicamentos = this.medicamentosOriginal;
        }
      });
    }
    else {

      this.limpiarCampoBusqueda();

      //Se elimina el medicamento del arreglo.
      let indice = this.medicamentosOriginal.findIndex(elemento => elemento["indice_arreglo"] == indiceArreglo);
      this.medicamentosOriginal.splice(indice, 1);
      this.medicamentos = this.medicamentosOriginal;
    }

  }

  /*----------------------------------------------------------------------|
  |  NOMBRE: agregarMedicamento.                                          |
  |-----------------------------------------------------------------------|
  |  DESCRIPCIÓN: Método para dar de agregar un medicamento.              | 
  |-----------------------------------------------------------------------|
  |  AUTOR: Ricardo Luna.                                                 |
  |-----------------------------------------------------------------------|
  |  FECHA: 30/09/2019.                                                   |    
  |----------------------------------------------------------------------*/
  agregarMedicamento(medicamentoAEditar?) {

    this.utilidadesService.agregarMedicamento(AgregarMedicamentoComponent, medicamentoAEditar).subscribe(medicamento => {

      //Si el medicamento es válido. Se agrega a la receta.
      if (medicamento) {

        //Se prepara el medicamento para agregarlo a la receta.
        let medicamentoAAgregar = ({
          id: medicamento.medicamento.id,
          nombre_medicamento: medicamento.medicamento.nombre_medicamento,
          nombre_generico: medicamento.medicamento.nombre_generico,
          nombre_forma_farmaceutica: medicamento.medicamento.nombre_forma_farmaceutica,
          presentacion: medicamento.medicamento.presentacion,
          nombre_via_administracion: medicamento.medicamento.nombre_via_administracion,
          dosis: medicamento.dosis,
          frecuencia: medicamento.frecuencia,
          frecuencia_unidad_tiempo_abreviatura: medicamento.frecuencia_unidad_tiempo_abreviatura,
          frecuencia_unidad_tiempo_id: medicamento.frecuencia_unidad_tiempo_id,
          duracion: medicamento.duracion,
          duracion_unidad_tiempo_abreviatura: medicamento.duracion_unidad_tiempo_abreviatura,
          duracion_unidad_tiempo_id: medicamento.duracion_unidad_tiempo_id,
          indicaciones_uso: medicamento.indicaciones_uso,
          indice_arreglo: this.medicamentosOriginal.length
        });
      
        //Si se está editando un medicamento.
        if (medicamentoAEditar) {
          //Se elimina el registro para poder insertar el nuevo regisstro editado.
          this.eliminarMedicamento(medicamentoAEditar["indice_arreglo"], false);
        }

        //Si el medicamento ya está agregado a la receta-
        if (this.utilidadesService.existeElementoArreglo("id", medicamento.medicamento.id, this.medicamentosOriginal)) {
          this.utilidadesService.confirmacion("Medicamento existente", "El medicamento ya está agregado a la receta. ¿Desea agregarlo de nuevo?").subscribe(respuesta => {
            //Se agrega el medicamento.
            if (respuesta == "Aceptar") {
              this.medicamentosOriginal.push(medicamentoAAgregar);
              this.medicamentos = this.medicamentosOriginal;
            }
          })
        }
        //Si el medicamento es nuevo.
        else {
          //Se agrega el medicamento.
          this.medicamentosOriginal.push(medicamentoAAgregar);
          this.medicamentos = this.medicamentosOriginal;
        }


      }

    });

  }


}
