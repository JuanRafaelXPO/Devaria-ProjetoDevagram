import { NextApiRequest, NextApiResponse } from "next";
import { conectarMongoDB } from "../../middlewares/conectarMongoDB";
import { SeguidorModel } from "../../models/SeguidorModel";
import { validarTokenJWT } from "../../middlewares/validarTokenJWT";
import { UsuarioModel } from "../../models/UsuarioModel";
import { RespostaPadraoMsg } from "../../types/RespostaPadraoMsg";

const seguirEndpoint 
    = async (req : NextApiRequest, res : NextApiResponse<RespostaPadraoMsg>) => {
    
    try{
        if(req.method === 'PUT'){
            const {userId, id} = req?.query;

            const usuarioLogado = await UsuarioModel.findById(userId)
            if(!usuarioLogado){
                return res.status(400).json({erro : 'Usuário logado não encontrado'})
            }
            
            const usuarioASerSeguido = await UsuarioModel.findById(id)
            if(!usuarioASerSeguido){
                return res.status(400).json({erro : 'Usuário a ser seguido não encontrado'})
            }

            const euJaSigoEsseUsuario = await SeguidorModel
                .find({usuarioId : usuarioLogado._id, usuarioSeguidoId : usuarioASerSeguido._id});
            if(euJaSigoEsseUsuario && euJaSigoEsseUsuario.length > 0){

                // decrementa um seguindo do usuário logado
                euJaSigoEsseUsuario.forEach(async(e : any) => await SeguidorModel.findByIdAndDelete({_id : e._id}));
                usuarioLogado.seguindo--;
                await UsuarioModel.findByIdAndUpdate({_id : usuarioLogado._id}, usuarioLogado);

                // decrementa um seguidor do usuario que foi seguido
                usuarioASerSeguido.seguidores--;
                await UsuarioModel.findByIdAndUpdate({_id : usuarioASerSeguido._id}, usuarioASerSeguido);
                
                return res.status(200).json({msg : 'Usuário deixado de seguir com sucesso'});
            }else{
                const seguidor = {
                    usuarioId : usuarioLogado._id,
                    usuarioSeguidoId : usuarioASerSeguido._id
                }
                await SeguidorModel.create(seguidor);
                
                // adiciona um seguindo no usuário logado
                usuarioLogado.seguindo++;
                await UsuarioModel.findByIdAndUpdate({_id : usuarioLogado._id}, usuarioLogado);

                // adiciona um seguidor no usuario a ser seguido
                usuarioASerSeguido.seguidores++;
                await UsuarioModel.findByIdAndUpdate({_id : usuarioASerSeguido._id}, usuarioASerSeguido);
                
                return res.status(200).json({msg : 'Usuário seguido com sucesso'});
            }
        }
        return res.status(405).json({erro : 'Método informado não é válido'})
        
    }catch(e){
        console.log(e);
        return res.status(500).json({erro : 'Ocorreu um erro ao seguir/deixar de seguir o usuário'})
    }
}

export default validarTokenJWT(conectarMongoDB(seguirEndpoint));