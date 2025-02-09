import dotenv from "dotenv";
import multer from "multer";
import GameMap from "../../../database/models/GameMapModel.js";
import bodyParser from "body-parser";
import path from "path";
import fs from "node:fs/promises";
import Server from "../../../Server.js";

export default class AdminMapRoutes {

    constructor() {
        dotenv.config()

        this.upload = multer({ dest: 'uploads/' })

        this.bind()
    }

    bind() {

        ZombieServer.app.get('/admin/maps/', async (req, res) => {
            console.log(req.isAuthenticated(), req?.user?.isAdmin)
            if (req.isAuthenticated() && req?.user?.isAdmin) {
                res.json(await GameMap.find({}))
            } else {
                res.json([])
            }
        })

        ZombieServer.app.post('/admin/maps/register', this.upload.fields([{name: 'map-file'}, {name: 'map-preview'}]), async (req, res) => {

            if (!req.isAuthenticated()) {
                return res.json({
                    message: 'not connected'
                })
            }
            if (!req.user.isAdmin) {
                return res.json({
                    message: 'not admin'
                })
            }

            let isValid = this.isMapValid(req)

            console.log('isvalid', isValid)

            if (!isValid.valid)
                return res.json({
                    message: 'not admin',
                    error: `Map is not valid : ${isValid.error}`
                })

            // create map and save into DB
            let newMap = new GameMap({
                name: req.body.mapName,
                filename: req.files['map-file'][0].originalname,
                uploadFilename: req.files['map-file'][0].filename,
                preview: req.files['map-preview'][0].originalname,
                previewFilename: req.files['map-preview'][0].filename,
                playable: false,
            });

            try {
                const response = await newMap.save()
                console.log(`[ADMIN][MAP] map ${req.body.mapName} saved`)
                return res.redirect('/admin/maps')
            } catch (e) {
                console.log(e)
            }

        })

        ZombieServer.app.post('/admin/maps/delete', bodyParser.json(), async (req, res) => {
            if (!req.isAuthenticated())
                return res.redirect('/')

            let response = await GameMap.deleteOne({_id: req.body._id})
            console.log(`[ADMIN][MAP] map ${req.body.mapName} deleted`)
            return res.json(response)
        })

        ZombieServer.app.post('/admin/maps/accept', bodyParser.json(), async (req, res) => {
            if (!req.isAuthenticated())
                return res.redirect('/')

            const map = await GameMap.findOne({_id: req.body._id})
            if (!map)
                return res.redirect('/admin/maps')

            // copy files from upload to assets
            let uploadPath = path.join(Server.__dirname, '../../uploads')
            let assetsPath = path.join(Server.__dirname, './resources')

            // model
            let gltfFromUploads = path.join(uploadPath, map.uploadFilename)
            let gltfPath = path.join(assetsPath, 'gltf/maps', map.filename)
            let gltfResponse = await fs.copyFile(gltfFromUploads, gltfPath)

            // img
            let imgFromUploads = path.join(uploadPath, map.previewFilename)
            let imgPath = path.join(assetsPath, 'img/map-preview', map.preview)
            let imgResponse = await fs.copyFile(imgFromUploads, imgPath)

            // update map info
            map.playable = true

            await map.save()
            console.log(`[ADMIN][MAP] map ${req.body.mapName} is now playable`)
            return res.json({})
        })

        ZombieServer.app.post('/admin/maps/unaccept', bodyParser.json(), async (req, res) => {
            if (!req.isAuthenticated())
                return res.redirect('/')

            const map = await GameMap.findOne({_id: req.body._id})
            if (!map)
                return res.redirect('/admin/maps')

            // delete files in assets

            // update map info
            map.playable = false

            await map.save()
            console.log(`[ADMIN][MAP] map ${req.body.mapName} is not playable anymore`)
            return res.json({})
        })

        ZombieServer.app.get('/maps/available', async (req, res) => {
            if (!req.isAuthenticated())
                return res.redirect('/')
            return res.json(await GameMap.find({playable: true}))
        })



    }

    isMapValid(req) {
        let error = ''
        let valid = true

        console.log(req.body)
        console.log(req.files)
        // return {
        //     valid: false,
        //     error: 'error'
        // }

        if (req.body['map-name'].length <= 0) {
            error += ' Missing map name '
            valid = false
        }

        if (req.files['map-file'] === undefined) {
            error += ' Missing files '
            valid = false
        }

        if (req.files['map-preview'] === undefined) {
            error += ' Missing preview '
            valid = false
        }

        return {
            valid: valid,
            error: error
        }
    }

}
