import type { NextApiRequest, NextApiResponse } from "next";
import type { RespostaPadraoMsg } from "../../types/RespostaPadraoMsg";
import { validarTokenJWT } from "../../middlewares/validarTokenJWT";
import { conectarMongoDB } from "../../middlewares/conectarMongoDB";
import { UsuarioModel } from "../../models/UsuarioModel";
import nc from "next-connect";
import { upload, uploadImagemCosmic } from "../../services/uploadImagemCosmic";
import { politicaCORS } from "../../middlewares/politcaCORS";
import md5 from "md5";

const handler = nc()
    .use(upload.single('file'))
    .put(async(req : any, res : NextApiResponse<RespostaPadraoMsg>) => {
        try{
            const {userId} = req?.query;
            const usuario = await UsuarioModel.findById(userId);

            if(!usuario){
                return res.status(400).json({erro : 'Usuário não encontrado'})
            }

            // Trocar nick de usuário
            const {nome} = req.body;
            const max_caracteres = 4;
            if(nome){
                if(nome.length < max_caracteres){
                    return res.status(400).json({erro : `O nome deve ter no mínimo ${max_caracteres} caracteres`})
                }
                usuario.nome = nome;
            }

            // Trocar senha do usuário
            const {novaSenha} = req.body;
            if(novaSenha){
                if(novaSenha.length < 4){
                    return res.status(400).json({erro : 'A senha deve ter no mínimo 4 caracteres'})
                }
                usuario.senha = md5(novaSenha);
            }
            

            // Trocar avatar do usuário
            const {file} = req;
            if(file && file.originalname){
                const image = await uploadImagemCosmic(req);
                if(image && image.media && image.media.url){
                    usuario.avatar = image.media.url;
                }
            }

            // Trocar email do usuário
            const {email} = req.body;
            if(email && email.length >= 5){
                if(!email.includes('@') || !email.includes('.') || email.includes(' ')){
                    return res.status(400).json({erro : 'Email invalido'});
                }
                usuario.email = email;
            }
            
            await UsuarioModel.findByIdAndUpdate({_id : usuario._id}, usuario);

            return res.status(200).json({msg: 'Usuário alterado com sucesso'});
            
        }catch(e){
            console.log(e);
            return res.status(400).json({erro : 'Não foi possível atualizar o usuário' + e});
        }
    })
    .get(async (req : NextApiRequest, res : NextApiResponse<RespostaPadraoMsg | any>) => {
        try{
            const {userId} = req?.query;
            const usuario = await UsuarioModel.findById(userId);
            usuario.senha = null;
            return res.status(200).json(usuario);
        }catch(e){
            console.log(e);
            return res.status(400).json({erro: 'Não foi possível obter dados do usuário'})
        }
    
    })

export const config = {
    api : {
        bodyParser: false
    }
}

export default politicaCORS(validarTokenJWT(conectarMongoDB(handler)));