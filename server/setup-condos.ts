
import { db } from "./db";
import { condominiums } from "../shared/schema";
import { eq, inArray } from "drizzle-orm";

async function setupCondominiums() {
  console.log("Iniciando a configuração de condomínios...");

  try {
    // 1. Excluir condomínios de teste
    const testCondoNames = ["CondominioTeste01", "CondominioDemo"];
    console.log(`Procurando por condomínios de teste para excluir: ${testCondoNames.join(", ")}`);
    
    if (!db) {
      console.error("Conexão com o banco de dados não encontrada. Verifique a configuração em server/db.ts");
      return;
    }

    const deleted = await db.delete(condominiums).where(inArray(condominiums.name, testCondoNames)).returning({ id: condominiums.id });
    
    if (deleted.length > 0) {
        console.log(`Sucesso! ${deleted.length} condomínio(s) de teste foram excluídos.`);
    } else {
        console.log("Nenhum condomínio de teste encontrado para excluir.");
    }

    // 2. Adicionar o primeiro condomínio oficial
    const newCondoName = "Condomínio Acqua Sena";
    const existingCondo = await db.query.condominiums.findFirst({
        where: eq(condominiums.name, newCondoName),
    });

    if (existingCondo) {
        console.log(`O condomínio "${newCondoName}" já existe. Criação ignorada.`);
    } else {
        console.log(`Adicionando condomínio oficial: ${newCondoName}`);
        await db.insert(condominiums).values({
            name: newCondoName,
            address: "Rua Cairú, Bairro Fátima",
            city: "Canoas",
            state: "RS",
            zipCode: "92200-690", // CEP estimado com base no endereço
            units: 1, // Valor de espaço reservado, pois é obrigatório
            description: "Construtora: Tenda, Tipo: Residencial",
            status: "approved", // Pré-aprovando o condomínio oficial
            inviteCode: Math.random().toString(36).substring(2, 8).toUpperCase(), // Gerar código de convite aleatório
        });
        console.log(`Sucesso! O condomínio "${newCondoName}" foi adicionado.`);
    }

    console.log("Configuração de condomínios finalizada.");

  } catch (error) {
    console.error("Erro durante a configuração de condomínios:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

setupCondominiums();
