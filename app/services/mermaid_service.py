"""
Mermaid Service for generating flowcharts, concept maps, and system diagrams
"""

import os
import asyncio
import base64
from typing import Dict, Any, List, Optional
from datetime import datetime
import json
import tempfile
from pathlib import Path

from app.models.innovation import (
    InnovationPhase, NeedItem, SolutionConcept, ImplementationPlan,
    MermaidDiagramResponse
)
from app.utils.logging import get_logger

logger = get_logger(__name__)

class MermaidService:
    """Service for generating Mermaid diagrams for innovation workflows"""
    
    def __init__(self):
        # Check if playwright is available for rendering
        self.playwright_available = False
        try:
            # This would be used for rendering Mermaid to PNG/SVG
            # For now, we'll focus on generating Mermaid code
            pass
        except ImportError:
            logger.warning("Playwright not available. Diagram rendering will be limited to Mermaid code.")
    
    async def generate_diagram(
        self,
        session_id: str,
        diagram_type: str,
        phase: Optional[InnovationPhase] = None,
        data_source: str = "session_data",
        customization: Dict[str, Any] = None
    ) -> MermaidDiagramResponse:
        """Generate Mermaid diagram based on session data"""
        
        try:
            # Generate diagram based on type
            if diagram_type == "phase_workflow":
                mermaid_code = await self._generate_phase_workflow_diagram(session_id, phase)
                title = f"Three-Phase Innovation Workflow"
            elif diagram_type == "need_map":
                mermaid_code = await self._generate_need_mapping_diagram(session_id)
                title = "Identified Needs Landscape"
            elif diagram_type == "solution_architecture":
                mermaid_code = await self._generate_solution_architecture_diagram(session_id)
                title = "Solution Architecture Overview"
            elif diagram_type == "business_model":
                mermaid_code = await self._generate_business_model_diagram(session_id)
                title = "Business Model Canvas"
            elif diagram_type == "regulatory_pathway":
                mermaid_code = await self._generate_regulatory_pathway_diagram(session_id)
                title = "Regulatory Approval Pathway"
            elif diagram_type == "stakeholder_map":
                mermaid_code = await self._generate_stakeholder_map_diagram(session_id)
                title = "Stakeholder Ecosystem"
            else:
                mermaid_code = await self._generate_generic_flowchart(session_id, diagram_type)
                title = f"Custom Diagram: {diagram_type}"
            
            # Apply customizations
            if customization:
                mermaid_code = self._apply_customizations(mermaid_code, customization)
            
            # Generate unique diagram ID
            diagram_id = f"{session_id}_{diagram_type}_{int(datetime.utcnow().timestamp())}"
            
            # Try to render if possible (placeholder for now)
            svg_data = None
            png_data = None
            
            # In a real implementation, would use playwright to render
            # svg_data = await self._render_to_svg(mermaid_code)
            # png_data = await self._render_to_png(mermaid_code)
            
            return MermaidDiagramResponse(
                diagram_id=diagram_id,
                mermaid_code=mermaid_code,
                svg_data=svg_data,
                png_data=png_data,
                diagram_title=title,
                generated_at=datetime.utcnow()
            )
            
        except Exception as e:
            logger.error(f"Error generating {diagram_type} diagram: {str(e)}")
            # Return a simple error diagram
            error_diagram = f"""
            flowchart TD
                A[Error Generating Diagram] --> B[{diagram_type}]
                B --> C[Error: {str(e)[:50]}...]
            """
            
            return MermaidDiagramResponse(
                diagram_id=f"error_{int(datetime.utcnow().timestamp())}",
                mermaid_code=error_diagram,
                diagram_title=f"Error: {diagram_type}",
                generated_at=datetime.utcnow()
            )
    
    async def _generate_phase_workflow_diagram(
        self,
        session_id: str,
        current_phase: Optional[InnovationPhase] = None
    ) -> str:
        """Generate workflow diagram showing three-phase process"""
        
        # Color coding based on current phase
        identify_color = "fill:#e1f5fe" if current_phase == InnovationPhase.IDENTIFY else "fill:#f5f5f5"
        invent_color = "fill:#e8f5e8" if current_phase == InnovationPhase.INVENT else "fill:#f5f5f5"
        implement_color = "fill:#fff3e0" if current_phase == InnovationPhase.IMPLEMENT else "fill:#f5f5f5"
        
        mermaid_code = f"""
        flowchart TD
            Start([Start Innovation Process]) --> Identify[IDENTIFY Phase<br/>Problem Definition & Need Discovery]
            
            Identify --> I1[Upload Market Research]
            Identify --> I2[Analyze Clinical Evidence]
            Identify --> I3[Stakeholder Interviews]
            Identify --> I4[Medical Expert Review]
            
            I1 --> IEval{{Need Evaluation & Prioritization}}
            I2 --> IEval
            I3 --> IEval
            I4 --> IEval
            
            IEval --> Gate1{{Decision Gate 1<br/>Ready for INVENT?}}
            Gate1 -->|Yes| Invent[INVENT Phase<br/>Solution Ideation & Development]
            Gate1 -->|No| Identify
            
            Invent --> V1[Solution Brainstorming]
            Invent --> V2[Technical Feasibility]
            Invent --> V3[Business Model Design]
            Invent --> V4[Multi-Agent Debate]
            
            V1 --> VEval{{Solution Evaluation & Selection}}
            V2 --> VEval
            V3 --> VEval
            V4 --> VEval
            
            VEval --> Gate2{{Decision Gate 2<br/>Ready for IMPLEMENT?}}
            Gate2 -->|Yes| Implement[IMPLEMENT Phase<br/>Business Strategy & Go-to-Market]
            Gate2 -->|No| Invent
            
            Implement --> M1[Regulatory Strategy]
            Implement --> M2[Commercial Planning]
            Implement --> M3[Financial Modeling]
            Implement --> M4[Risk Assessment]
            
            M1 --> Final{{Final Business Case}}
            M2 --> Final
            M3 --> Final
            M4 --> Final
            
            Final --> Decision{{Go/No-Go Decision}}
            Decision -->|Go| Launch[Launch Project]
            Decision -->|No-Go| Archive[Archive & Learn]
            Decision -->|Pivot| Identify
            
            classDef identifyPhase {identify_color},stroke:#01579b,stroke-width:2px
            classDef inventPhase {invent_color},stroke:#2e7d32,stroke-width:2px
            classDef implementPhase {implement_color},stroke:#e65100,stroke-width:2px
            classDef decision fill:#ffebee,stroke:#c62828,stroke-width:2px
            
            class Identify,I1,I2,I3,I4,IEval identifyPhase
            class Invent,V1,V2,V3,V4,VEval inventPhase
            class Implement,M1,M2,M3,M4 implementPhase
            class Gate1,Gate2,Decision,Final decision
        """
        
        return mermaid_code
    
    async def _generate_need_mapping_diagram(self, session_id: str) -> str:
        """Generate diagram mapping identified needs and their relationships"""
        
        # In real implementation, would fetch actual needs from session
        # For now, creating a template diagram
        
        mermaid_code = """
        mindmap
            root((Healthcare Innovation Needs))
                Clinical Needs
                    Patient Safety
                        Medication Errors
                        Infection Prevention
                        Diagnostic Accuracy
                    Treatment Efficacy
                        Personalized Medicine
                        Drug Delivery
                        Therapeutic Monitoring
                    Care Coordination
                        Information Sharing
                        Workflow Integration
                        Communication
                Market Needs
                    Cost Reduction
                        Healthcare Economics
                        Resource Optimization
                        Process Efficiency
                    Access Improvement
                        Rural Healthcare
                        Underserved Populations
                        Telemedicine
                    Quality Enhancement
                        Outcome Measurement
                        Patient Experience
                        Provider Satisfaction
                Technology Needs
                    Digital Health
                        Data Interoperability
                        AI/ML Integration
                        Mobile Health
                    Medical Devices
                        Miniaturization
                        Connectivity
                        User Interface
                    Infrastructure
                        Cloud Computing
                        Cybersecurity
                        Scalability
        """
        
        return mermaid_code
    
    async def _generate_solution_architecture_diagram(self, session_id: str) -> str:
        """Generate solution architecture diagram"""
        
        mermaid_code = """
        graph TB
            subgraph "User Interface Layer"
                Web[Web Application]
                Mobile[Mobile App]
                API[REST API]
            end
            
            subgraph "Application Layer"
                Auth[Authentication]
                BL[Business Logic]
                WF[Workflow Engine]
            end
            
            subgraph "Integration Layer"
                EHR[EHR Integration]
                Device[Device APIs]
                External[External Services]
            end
            
            subgraph "Data Layer"
                DB[(Primary Database)]
                Cache[(Cache Layer)]
                Files[(File Storage)]
            end
            
            subgraph "AI/ML Layer"
                Models[ML Models]
                Training[Model Training]
                Inference[Inference Engine]
            end
            
            Web --> Auth
            Mobile --> Auth
            API --> Auth
            
            Auth --> BL
            BL --> WF
            WF --> EHR
            WF --> Device
            WF --> External
            
            BL --> DB
            BL --> Cache
            BL --> Files
            
            BL --> Models
            Models --> Training
            Models --> Inference
            
            classDef ui fill:#e3f2fd,stroke:#1976d2
            classDef app fill:#e8f5e8,stroke:#388e3c
            classDef integration fill:#fff3e0,stroke:#f57c00
            classDef data fill:#fce4ec,stroke:#c2185b
            classDef ai fill:#f3e5f5,stroke:#7b1fa2
            
            class Web,Mobile,API ui
            class Auth,BL,WF app
            class EHR,Device,External integration
            class DB,Cache,Files data
            class Models,Training,Inference ai
        """
        
        return mermaid_code
    
    async def _generate_business_model_diagram(self, session_id: str) -> str:
        """Generate business model canvas diagram"""
        
        mermaid_code = """
        graph LR
            subgraph "Key Partners"
                KP1[Healthcare Providers]
                KP2[Technology Partners]
                KP3[Regulatory Consultants]
                KP4[Distribution Partners]
            end
            
            subgraph "Key Activities"
                KA1[Product Development]
                KA2[Clinical Validation]
                KA3[Regulatory Approval]
                KA4[Market Development]
            end
            
            subgraph "Key Resources"
                KR1[R&D Team]
                KR2[IP Portfolio]
                KR3[Clinical Data]
                KR4[Manufacturing]
            end
            
            subgraph "Value Propositions"
                VP1[Improved Patient Outcomes]
                VP2[Cost Reduction]
                VP3[Workflow Efficiency]
                VP4[Evidence-Based Care]
            end
            
            subgraph "Customer Relationships"
                CR1[Personal Assistance]
                CR2[Self-Service Platform]
                CR3[Community Building]
                CR4[Co-creation]
            end
            
            subgraph "Channels"
                CH1[Direct Sales]
                CH2[Partner Network]
                CH3[Digital Platform]
                CH4[Trade Shows]
            end
            
            subgraph "Customer Segments"
                CS1[Hospitals]
                CS2[Clinics]
                CS3[Physicians]
                CS4[Patients]
            end
            
            subgraph "Cost Structure"
                CO1[R&D Costs]
                CO2[Regulatory Costs]
                CO3[Manufacturing]
                CO4[Sales & Marketing]
            end
            
            subgraph "Revenue Streams"
                RS1[Product Sales]
                RS2[Subscription Fees]
                RS3[Licensing]
                RS4[Services]
            end
            
            KP1 --> KA1
            KA1 --> VP1
            VP1 --> CS1
            CS1 --> RS1
            
            classDef partners fill:#ffebee,stroke:#c62828
            classDef activities fill:#e8f5e8,stroke:#2e7d32
            classDef resources fill:#e3f2fd,stroke:#1565c0
            classDef value fill:#fff3e0,stroke:#ef6c00
            classDef relationships fill:#f3e5f5,stroke:#7b1fa2
            classDef channels fill:#e0f2f1,stroke:#00695c
            classDef segments fill:#fce4ec,stroke:#ad1457
            classDef costs fill:#ffebee,stroke:#d32f2f
            classDef revenue fill:#e8f5e8,stroke:#388e3c
            
            class KP1,KP2,KP3,KP4 partners
            class KA1,KA2,KA3,KA4 activities
            class KR1,KR2,KR3,KR4 resources
            class VP1,VP2,VP3,VP4 value
            class CR1,CR2,CR3,CR4 relationships
            class CH1,CH2,CH3,CH4 channels
            class CS1,CS2,CS3,CS4 segments
            class CO1,CO2,CO3,CO4 costs
            class RS1,RS2,RS3,RS4 revenue
        """
        
        return mermaid_code
    
    async def _generate_regulatory_pathway_diagram(self, session_id: str) -> str:
        """Generate regulatory approval pathway diagram"""
        
        mermaid_code = """
        flowchart TD
            Start([Innovation Concept]) --> PreSub[Pre-Submission Meeting]
            PreSub --> Strategy{Regulatory Strategy}
            
            Strategy --> |Medical Device| Device[Medical Device Pathway]
            Strategy --> |Drug/Biologic| Drug[Drug Development Pathway]
            Strategy --> |Digital Health| Digital[Digital Health Pathway]
            
            Device --> DevClass{Device Classification}
            DevClass --> |Class I| C1[510k Exempt]
            DevClass --> |Class II| C2[510k Submission]
            DevClass --> |Class III| C3[PMA Required]
            
            Drug --> Phase1[Phase I Clinical Trial]
            Phase1 --> Phase2[Phase II Clinical Trial]
            Phase2 --> Phase3[Phase III Clinical Trial]
            Phase3 --> NDA[NDA/BLA Submission]
            
            Digital --> SaMD[SaMD Classification]
            SaMD --> DigClass{Risk Classification}
            DigClass --> |Low Risk| DigLow[Quality Management]
            DigClass --> |Moderate Risk| DigMod[Clinical Evidence]
            DigClass --> |High Risk| DigHigh[Comprehensive Validation]
            
            C1 --> Market1[Market Authorization]
            C2 --> FDA510[FDA 510k Review]
            C3 --> FDAPMA[FDA PMA Review]
            
            FDA510 --> |Approved| Market2[Market Authorization]
            FDA510 --> |More Info| Response1[Response to FDA]
            Response1 --> FDA510
            
            FDAPMA --> |Approved| Market3[Market Authorization]
            FDAPMA --> |More Info| Response2[Response to FDA]
            Response2 --> FDAPMA
            
            NDA --> FDAReview[FDA Review Process]
            FDAReview --> |Approved| Market4[Market Authorization]
            FDAReview --> |CRL| CRL[Complete Response Letter]
            CRL --> Response3[Address FDA Comments]
            Response3 --> FDAReview
            
            DigLow --> Market5[Market Authorization]
            DigMod --> DigReview[Regulatory Review]
            DigHigh --> DigReview
            DigReview --> Market6[Market Authorization]
            
            Market1 --> PostMarket[Post-Market Surveillance]
            Market2 --> PostMarket
            Market3 --> PostMarket
            Market4 --> PostMarket
            Market5 --> PostMarket
            Market6 --> PostMarket
            
            classDef start fill:#e8f5e8,stroke:#2e7d32
            classDef decision fill:#fff3e0,stroke:#ef6c00
            classDef process fill:#e3f2fd,stroke:#1565c0
            classDef approval fill:#e8f5e8,stroke:#2e7d32
            classDef feedback fill:#ffebee,stroke:#c62828
            
            class Start start
            class Strategy,DevClass,DigClass decision
            class PreSub,Device,Drug,Digital,Phase1,Phase2,Phase3,SaMD,FDA510,FDAPMA,FDAReview,DigReview process
            class Market1,Market2,Market3,Market4,Market5,Market6,PostMarket approval
            class Response1,Response2,Response3,CRL feedback
        """
        
        return mermaid_code
    
    async def _generate_stakeholder_map_diagram(self, session_id: str) -> str:
        """Generate stakeholder ecosystem diagram"""
        
        mermaid_code = """
        graph TB
            subgraph "Primary Stakeholders"
                Patient[Patients]
                Provider[Healthcare Providers]
                Payer[Payers/Insurance]
            end
            
            subgraph "Healthcare Ecosystem"
                Hospital[Hospitals]
                Clinic[Clinics]
                Pharmacy[Pharmacies]
                Lab[Laboratories]
            end
            
            subgraph "Regulatory & Policy"
                FDA[FDA/Regulators]
                Policy[Policy Makers]
                Ethics[Ethics Committees]
                Quality[Quality Organizations]
            end
            
            subgraph "Innovation Ecosystem"
                Company[Our Company]
                Competitors[Competitors]
                Partners[Technology Partners]
                Investors[Investors/Funders]
            end
            
            subgraph "Research & Academia"
                University[Universities]
                Research[Research Institutions]
                KOL[Key Opinion Leaders]
                Society[Medical Societies]
            end
            
            subgraph "Supply Chain"
                Supplier[Suppliers]
                Distributor[Distributors]
                Manufacturer[Manufacturers]
                Service[Service Providers]
            end
            
            Company --> Patient
            Company --> Provider
            Company --> Payer
            
            Provider --> Patient
            Payer --> Patient
            
            Hospital --> Provider
            Clinic --> Provider
            Pharmacy --> Patient
            Lab --> Provider
            
            FDA --> Company
            Policy --> Payer
            Ethics --> Research
            Quality --> Provider
            
            Competitors --> Company
            Partners --> Company
            Investors --> Company
            
            University --> Research
            Research --> KOL
            KOL --> Provider
            Society --> Provider
            
            Supplier --> Company
            Distributor --> Hospital
            Manufacturer --> Company
            Service --> Provider
            
            classDef primary fill:#e8f5e8,stroke:#2e7d32,stroke-width:3px
            classDef healthcare fill:#e3f2fd,stroke:#1565c0
            classDef regulatory fill:#fff3e0,stroke:#ef6c00
            classDef innovation fill:#f3e5f5,stroke:#7b1fa2
            classDef research fill:#ffebee,stroke:#c62828
            classDef supply fill:#e0f2f1,stroke:#00695c
            
            class Patient,Provider,Payer primary
            class Hospital,Clinic,Pharmacy,Lab healthcare
            class FDA,Policy,Ethics,Quality regulatory
            class Company,Competitors,Partners,Investors innovation
            class University,Research,KOL,Society research
            class Supplier,Distributor,Manufacturer,Service supply
        """
        
        return mermaid_code
    
    async def _generate_generic_flowchart(self, session_id: str, diagram_type: str) -> str:
        """Generate a generic flowchart for unknown diagram types"""
        
        mermaid_code = f"""
        flowchart TD
            A[Start: {diagram_type}] --> B[Data Collection]
            B --> C[Analysis]
            C --> D[Evaluation]
            D --> E[Decision]
            E --> |Yes| F[Implementation]
            E --> |No| G[Revision]
            G --> C
            F --> H[Monitoring]
            H --> I[Success]
        """
        
        return mermaid_code
    
    def _apply_customizations(self, mermaid_code: str, customization: Dict[str, Any]) -> str:
        """Apply customizations to Mermaid diagram"""
        
        # Simple customizations - in real implementation would be more sophisticated
        if "theme" in customization:
            theme = customization["theme"]
            if theme == "dark":
                mermaid_code = f"%%{{init: {{'theme':'dark'}}}}%%\n{mermaid_code}"
            elif theme == "neutral":
                mermaid_code = f"%%{{init: {{'theme':'neutral'}}}}%%\n{mermaid_code}"
        
        if "title" in customization:
            title = customization["title"]
            mermaid_code = f"---\ntitle: {title}\n---\n{mermaid_code}"
        
        return mermaid_code
    
    async def get_available_diagram_types(self) -> List[Dict[str, str]]:
        """Get list of available diagram types"""
        
        return [
            {
                "type": "phase_workflow",
                "name": "Three-Phase Workflow",
                "description": "Shows the complete IDENTIFY-INVENT-IMPLEMENT process flow"
            },
            {
                "type": "need_map",
                "name": "Need Mapping",
                "description": "Visual map of identified healthcare needs and relationships"
            },
            {
                "type": "solution_architecture",
                "name": "Solution Architecture",
                "description": "Technical architecture of the proposed solution"
            },
            {
                "type": "business_model",
                "name": "Business Model Canvas",
                "description": "Visual representation of the business model"
            },
            {
                "type": "regulatory_pathway",
                "name": "Regulatory Pathway",
                "description": "Step-by-step regulatory approval process"
            },
            {
                "type": "stakeholder_map",
                "name": "Stakeholder Ecosystem",
                "description": "Map of all stakeholders in the healthcare innovation ecosystem"
            }
        ]
