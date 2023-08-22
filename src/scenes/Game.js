import Phaser from "../lib/phaser.js";

import Carrot from "../game/Carrot.js";

export default class Game extends Phaser.Scene
{
    constructor()
    {
        super('game')
    }

    preload()
    {
        //fondo
        this.load.image('fondo', '/src/assets/bg_layer1.png')

        //plataforma
        this.load.image('plataforma', '/src/assets/ground_grass.png')

        //personaje
        this.load.image('conejito', '/src/assets/bunny1_stand.png')

        //zanahorias
        this.load.image('carrot', '/src/assets/carrot.png')

        //inicializando teclado
        this.cursors = this.input.keyboard.createCursorKeys()
    }

    carrots

    create()
    {
        this.add.image(240, 320, 'fondo').setScrollFactor(1, 0)
        //this.physics.add.image(240, 320, 'plataforma').setScale(0.5)

        //creando matriz de plataformas aleatorias
        //creando grupo de plataformas
        this.plataformas = this.physics.add.staticGroup()

        //plataformas en grupos de 5 de forma aleatoria
        for(let i=0; i<5; ++i)
        {
            const x = Phaser.Math.Between(80, 400)
            const y = 150 * i

            const plataforma = this.plataformas.create(x, y, 'plataforma')
            plataforma.scale = 0.5
            
            const body = plataforma.body
            body.updateFromGameObject()
        }

        //creando sprite de conejito
        this.player = this.physics.add.sprite(240, 320, 'conejito').setScale(0.5)

        //colision entre plataforma y jugador
        this.physics.add.collider(this.plataformas, this.player)

        this.player.body.checkCollision.up = false
        this.player.body.checkCollision.left = false
        this.player.body.checkCollision.right = false

       //la pantalla se mueve con el jugador
        this.cameras.main.startFollow(this.player)

        //deteniendo el scrolling horizontal
        this.cameras.main.setDeadzone(this.scale.width * 1.5)

        
        //creando zanahoria estatica
        //const carrot = new Carrot(this, 240, 320, 'carrot')
        //this.add.existing(Carrot)

        //creando zanahoria y dandole fisicas
        this.carrots = this.physics.add.group({
            classType: Carrot
        })

        
        this.carrots.get(240, 320, 'carrot')

        //colocando zanahorias en plataformas
        this.physics.add.collider(this.plataformas, this.carrots)
        
        //formateado de esta manera para que sea más fácil de leer
        this.physics.add.overlap(
            this.player,
            this.carrots,
            this.handleCollectCarrot, //llamado en overlap(superposicion)
            undefined,
            this
        )
    }

    update(t, dt)
    {
        this.plataformas.children.iterate(child => {
            const plataforma = child 

            const scrollY = this.cameras.main.scrollY
            if(plataforma.y >= scrollY + 700)
            {
                plataforma.y = scrollY - Phaser.Math.Between(50, 100)
                plataforma.body.updateFromGameObject()

                //creando varias zanahorias
                this.addCarrotAbove(plataforma)
            }
        })
        
        //haciendo saltar al conejito
        const touchingDown = this.player.body.touching.down

        if(touchingDown){
            this.player.setVelocityY(-200)
        }

        //control del personaje
        if(this.cursors.left.isDown && !touchingDown)
        {
            this.player.setVelocityX(-200)
        }
        else if(this.cursors.right.isDown && !touchingDown)
        {
            this.player.setVelocityX(200)
        }
        else
        {
            //detener movimiento si no se presionan las teclas <-   ->
            this.player.setVelocityX(0);
        }

        this.horizontalWrap(this.player)
    }

    horizontalWrap(sprite)
    {
        const halfWidth = sprite.displayWidth * 0.5
        const gameWidth = this.scale.width
        if(sprite.x < -halfWidth)
        {
            sprite.x = gameWidth + halfWidth
        }
        else if (sprite.x > gameWidth + halfWidth)
        {
            sprite.x = -halfWidth
        }
    }

    handleCollectCarrot(player, carrot)
    {
        this.carrots.killAndHide(carrot)

        this.physics.world.disableBody(carrot.body)
    }

    addCarrotAbove(sprite)
    {
        const y = sprite.y - sprite.displayHeight

        const carrot = this.carrots.get(sprite.x, y, 'carrot')
        
        //activando carrots y haciendo visibles
        carrot.setActive(true)
        carrot.setVisible(true)

        this.add.existing(carrot)


        carrot.body.setSize(carrot.width, carrot.height)

        //asegurarse que carrot esta activo en el mundo fisico
        this.physics.world.enable(carrot)

        return carrot
    }

    
}