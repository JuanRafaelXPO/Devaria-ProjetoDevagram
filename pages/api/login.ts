import type { NextApiRequest, NextApiResponse } from "next";
import { conectarMongoDB } from "../../middlewares/conectarMongoDB";
import type { RespostaPadraoMsg } from "../../types/RespostaPadraoMsg";

const endpointLogin = (
    req : NextApiRequest,
    res : NextApiResponse<RespostaPadraoMsg>
) => {
    if(req.method === 'POST'){
        const {login, senha} = req.body;

        if(login === 'admin@admin.com' &&
            senha === 'admin123'){
            return res.status(200).json({msg : 'Usuário logado em sucesso.'});
        }
        return res.status(405).json({erro : 'Usuário não encontrado.'});
    }
    return res.status(405).json({erro : 'O método informado não é valido.'});
}

export default conectarMongoDB(endpointLogin);