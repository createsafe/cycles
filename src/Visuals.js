class Visuals{
    constructor(OBJ){
        this.vis = new OBJ.class();
        this.active = false;
        
    }
    
    init(){ 
        this.active = true;

    }
    midiIn(OBJ){
        this.vis.midiIn(OBJ);
    }
    update(OBJ){
        if(this.active){
            this.vis.update(OBJ)
        }
    }
}

export {Visuals};
